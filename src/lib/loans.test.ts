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

describe("nghiệp vụ yêu cầu mượn", () => {
  it("chỉ nhận các trạng thái yêu cầu hợp lệ", () => {
    expect(parseStatus("pending")).toBe("pending");
    expect(parseStatus("approved")).toBe("approved");
    expect(parseStatus("rejected")).toBe("rejected");
    expect(parseStatus("all")).toBe("");
    expect(parseStatus(null)).toBe("");
  });

  it("lọc yêu cầu theo vai trò, thêm tên sách và kẹp trang", () => {
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

  it("từ chối mượn khi hết bản cùng ngày lấy sách", () => {
    const book = db.books.find((item) => item.id === 6);
    expect(book).toBeDefined();
    if (!book) return;

    const pickupDate = "2026-12-02";
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
      quantity: 1,
      reason: "Lý do kiểm tra đủ dài",
    });

    expect(result).toEqual({ ok: false, message: "Sách đã hết bản vào ngày này" });
    expect(db.nextLoanId).toBe(originalNextLoanId);
  });

  it("tạo yêu cầu mới ở ngày còn bản và bỏ qua yêu cầu đã từ chối", () => {
    const book = db.books.find((item) => item.id === 1);
    expect(book).toBeDefined();
    if (!book) return;

    const pickupDate = "2099-05-01";
    db.loans.unshift({
      id: db.nextLoanId,
      bookId: book.id,
      userEmail: "sv01@ptit.edu.vn",
      pickupDate,
      term: 7,
      quantity: book.copies,
      reason: "Lý do kiểm tra đủ dài",
      status: "rejected",
    });

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
      expect(result.loan.status).toBe("pending");
      expect(db.loans[0]).toEqual(result.loan);
      expect(db.nextLoanId).toBe(originalNextLoanId + 1);
    }
  });

  it("trả đủ mã kết quả khi hủy yêu cầu", () => {
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
