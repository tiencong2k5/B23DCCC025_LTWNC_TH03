import type { Book } from "@/types";

export interface LoanInput {
  bookId: string;
  pickupDate: string;
  term: string;
  quantity: string;
  reason: string;
}

export interface LoanData {
  bookId: number;
  pickupDate: string;
  term: 7 | 14 | 30;
  quantity: number;
  reason: string;
}

export type LoanErrors = Partial<Record<keyof LoanInput, string>>;

export interface LoanFormState {
  errors: LoanErrors;
  values: Partial<LoanInput>;
  message?: string;
  ok?: boolean;
}

type RawLoanInput = Partial<Record<keyof LoanInput, unknown>>;

function isFormData(raw: FormData | RawLoanInput): raw is FormData {
  return typeof FormData !== "undefined" && raw instanceof FormData;
}

export function toLoanInput(raw: FormData | RawLoanInput): LoanInput {
  const getValue = (key: keyof LoanInput): string => {
    const value = isFormData(raw) ? raw.get(key) : raw[key];

    return typeof value === "string" ? value : "";
  };

  return {
    bookId: getValue("bookId"),
    pickupDate: getValue("pickupDate"),
    term: getValue("term"),
    quantity: getValue("quantity"),
    reason: getValue("reason"),
  };
}

export function today(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateLoan(input: LoanInput, books: Book[]): LoanErrors {
  const errors: LoanErrors = {};
  const selectedBook = books.find((book) => book.id === Number(input.bookId));

  if (!selectedBook || !/^\d+$/.test(input.bookId)) {
    errors.bookId = "Hãy chọn sách";
  }

  if (!isValidDate(input.pickupDate)) {
    errors.pickupDate = "Hãy chọn ngày";
  } else if (input.pickupDate < today()) {
    errors.pickupDate = "Ngày lấy sách không được ở quá khứ";
  }

  if (input.term !== "7" && input.term !== "14" && input.term !== "30") {
    errors.term = "Hãy chọn thời hạn";
  }

  const quantity = Number(input.quantity);
  if (!/^\d+$/.test(input.quantity) || !Number.isSafeInteger(quantity) || quantity < 1) {
    errors.quantity = "Số quyển phải từ 1 trở lên";
  } else if (selectedBook && quantity > selectedBook.copies) {
    errors.quantity = `Vượt số bản của sách (${selectedBook.copies} bản)`;
  }

  if (input.reason.trim().length < 10) {
    errors.reason = "Lý do tối thiểu 10 ký tự";
  }

  return errors;
}

export function toLoanData(input: LoanInput): LoanData {
  return {
    bookId: Number(input.bookId),
    pickupDate: input.pickupDate,
    term: Number(input.term) as LoanData["term"],
    quantity: Number(input.quantity),
    reason: input.reason.trim(),
  };
}
