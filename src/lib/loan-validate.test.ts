import { describe, expect, it } from "vitest";
import { db } from "./db";
import {
  today,
  toLoanData,
  toLoanInput,
  validateLoan,
  type LoanInput,
} from "./loan-validate";

const validInput: LoanInput = {
  bookId: "1",
  pickupDate: "2099-01-01",
  term: "14",
  quantity: "1",
  reason: "Phục vụ môn học",
};

describe("loan input validation", () => {
  it("normalizes form values and supplies empty strings for missing fields", () => {
    const formData = new FormData();
    formData.set("bookId", "6");
    formData.set("reason", "  Ôn tập môn học  ");

    expect(toLoanInput(formData)).toEqual({
      bookId: "6",
      pickupDate: "",
      term: "",
      quantity: "",
      reason: "  Ôn tập môn học  ",
    });
    expect(toLoanInput({ bookId: 6, reason: null })).toEqual({
      bookId: "",
      pickupDate: "",
      term: "",
      quantity: "",
      reason: "",
    });
  });

  it("validates valid data and converts it only after validation", () => {
    expect(validateLoan(validInput, db.books)).toEqual({});
    expect(toLoanData(validInput)).toEqual({
      bookId: 1,
      pickupDate: "2099-01-01",
      term: 14,
      quantity: 1,
      reason: "Phục vụ môn học",
    });
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns at most one error per invalid field", () => {
    expect(
      validateLoan(
        {
          bookId: "999",
          pickupDate: "2020-02-31",
          term: "10",
          quantity: "0",
          reason: " ngắn ",
        },
        db.books,
      ),
    ).toEqual({
      bookId: "Hãy chọn sách",
      pickupDate: "Hãy chọn ngày",
      term: "Hãy chọn thời hạn",
      quantity: "Số quyển phải từ 1 trở lên",
      reason: "Lý do tối thiểu 10 ký tự",
    });
  });

  it("checks date and quantity constraints against the selected book", () => {
    expect(
      validateLoan(
        { ...validInput, pickupDate: "2000-01-01" },
        db.books,
      ).pickupDate,
    ).toBe("Ngày lấy sách không được ở quá khứ");
    expect(
      validateLoan({ ...validInput, quantity: "2" }, db.books).quantity,
    ).toBe("Vượt số bản của sách (1 bản)");
  });
});
