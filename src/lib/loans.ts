import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import type { Loan, LoanStatus, Role } from "@/types";
import type { LoanData } from "./loan-validate";

export interface LoanViewer {
  email: string;
  role: Role;
}

export interface LoanListItem extends Loan {
  bookTitle: string;
}

export interface LoanList {
  items: LoanListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export function parseStatus(value: unknown): LoanStatus | "" {
  return value === "pending" || value === "approved" || value === "rejected"
    ? value
    : "";
}

export function listLoans(
  viewer: LoanViewer,
  status: LoanStatus | "",
  requestedPage: number,
): LoanList {
  const canViewAll = can(viewer.role, "loan:view-all");
  const viewableLoans = db.loans.filter(
    (loan) =>
      (canViewAll || loan.userEmail === viewer.email) &&
      (!status || loan.status === status),
  );
  const total = viewableLoans.length;
  const totalPages = Math.max(1, Math.ceil(total / 10));
  const page = Math.min(Math.max(Math.trunc(requestedPage) || 1, 1), totalPages);
  const start = (page - 1) * 10;

  return {
    items: viewableLoans.slice(start, start + 10).map((loan) => ({
      ...loan,
      bookTitle:
        db.books.find((book) => book.id === loan.bookId)?.title ??
        "Sách không còn trong danh mục",
    })),
    total,
    page,
    totalPages,
  };
}

export type SubmitLoanResult =
  | { ok: true; loan: Loan }
  | { ok: false; message: string };

export function submitLoan(email: string, data: LoanData): SubmitLoanResult {
  const book = db.books.find((item) => item.id === data.bookId);

  if (!book) {
    return { ok: false, message: "Sách không tồn tại" };
  }

  const reservedCopies = db.loans
    .filter(
      (loan) =>
        loan.bookId === data.bookId &&
        loan.pickupDate === data.pickupDate &&
        loan.status !== "rejected",
    )
    .reduce((total, loan) => total + loan.quantity, 0);

  if (reservedCopies + data.quantity > book.copies) {
    return { ok: false, message: "Sách đã hết bản vào ngày này" };
  }

  const loan: Loan = {
    id: db.nextLoanId,
    ...data,
    userEmail: email,
    status: "pending",
  };
  db.nextLoanId += 1;
  db.loans.unshift(loan);

  return { ok: true, loan };
}

export type CancelLoanResult = "ok" | "not-found" | "forbidden" | "not-pending";

export function cancelLoan(email: string, id: number): CancelLoanResult {
  const index = db.loans.findIndex((loan) => loan.id === id);

  if (index === -1) {
    return "not-found";
  }

  const loan = db.loans[index];
  if (loan.userEmail !== email) {
    return "forbidden";
  }

  if (loan.status !== "pending") {
    return "not-pending";
  }

  db.loans.splice(index, 1);
  return "ok";
}
