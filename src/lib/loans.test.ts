import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./db";
import {
  cancelLoan,
  listLoans,
  parseStatus,
  submitLoan,
} from "./loans";
import type { Loan } from "@/types";

const originalLoans = db.loans.map((loan) => ({ ...loan }));
const originalNextLoanId = db.nextLoanId;

beforeEach(() => {
  db.loans.splice(0, db.loans.length, ...originalLoans.map((loan) => ({ ...loan })));
  db.nextLoanId = originalNextLoanId;
});

describe("loan business logic", () => {
  it("parses only supported statuses", () => {
    expect(parseStatus("pending")).toBe("pending");
    expect(parseStatus("approved")).toBe("approved");
    expect(parseStatus("rejected")).toBe("rejected");
    expect(parseStatus("all")).toBe("");
    expect(parseStatus(null)).toBe("");
  });

  it("scopes student results, includes book names, and clamps pages", () => {
    const student = listLoans(
      { email: "sv01@ptit.edu.vn", role: "student" },
      "",
      99,
    );
    const admin = listLoans(
      { email: "admin@ptit.edu.vn", role: "admin" },
      "",
      1,
    );

    expect(student.total).toBe(27);
    expect(student.totalPages).toBe(3);
    expect(student.page).toBe(3);
    expect(student.items).toHaveLength(7);
    expect(student.items.every((loan) => loan.userEmail === "sv01@ptit.edu.vn")).toBe(true);
    expect(student.items[0].bookTitle).toBeTruthy();
    expect(admin.total).toBe(37);
    expect(admin.items).toHaveLength(10);
  });

  it("counts reserved copies for the same date and ignores rejected requests", () => {
    const book = db.books.find((item) => item.id === 1);
    expect(book).toBeDefined();
    if (!book) return;

    const pickupDate = "2099-05-01";
    const rejectedLoan: Loan = {
      id: db.nextLoanId,
      bookId: book.id,
      userEmail: "sv01@ptit.edu.vn",
      pickupDate,
      term: 7,
      quantity: book.copies,
      reason: "Lý do kiểm tra đủ dài",
      status: "rejected",
    };
    db.loans.unshift(rejectedLoan);

    const result = submitLoan("sv02@ptit.edu.vn", {
      bookId: book.id,
      pickupDate,
      term: 14,
      quantity: book.copies,
      reason: "Lý do kiểm tra đủ dài",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.loan.id).toBe(originalNextLoanId);
      expect(db.loans[0]).toEqual(result.loan);
    }

    expect(
      submitLoan("sv01@ptit.edu.vn", {
        bookId: book.id,
        pickupDate,
        term: 14,
        quantity: 1,
        reason: "Lý do kiểm tra đủ dài",
      }),
    ).toEqual({ ok: false, message: "Sách đã hết bản vào ngày này" });
  });

  it("cancels only the owner's pending request", () => {
    const pendingLoan = db.loans.find((loan) => loan.status === "pending");
    const approvedLoan = db.loans.find((loan) => loan.status === "approved");
    expect(pendingLoan).toBeDefined();
    expect(approvedLoan).toBeDefined();
    if (!pendingLoan || !approvedLoan) return;
    const sameOwnerApproved = db.loans.find(
      (loan) =>
        loan.status === "approved" && loan.userEmail === pendingLoan.userEmail,
    );
    expect(sameOwnerApproved).toBeDefined();
    if (!sameOwnerApproved) return;

    expect(cancelLoan("missing@ptit.edu.vn", -1)).toBe("not-found");
    expect(cancelLoan("different@ptit.edu.vn", pendingLoan.id)).toBe("forbidden");
    expect(cancelLoan(pendingLoan.userEmail, sameOwnerApproved.id)).toBe(
      "not-pending",
    );
    expect(cancelLoan(pendingLoan.userEmail, pendingLoan.id)).toBe("ok");
    expect(db.loans.some((loan) => loan.id === pendingLoan.id)).toBe(false);
  });
});
