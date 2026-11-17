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

describe("kiểm tra dữ liệu yêu cầu mượn", () => {
  it("chuyển dữ liệu form và thay trường thiếu bằng chuỗi rỗng", () => {
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

  it("chấp nhận dữ liệu hợp lệ và chuyển chuỗi thành dữ liệu có kiểu", () => {
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

  it("báo lỗi cho form trống và dữ liệu sai định dạng", () => {
    expect(
      validateLoan(
        { bookId: "", pickupDate: "", term: "", quantity: "", reason: "" },
        db.books,
      ),
    ).toEqual({
      bookId: "Hãy chọn sách",
      pickupDate: "Hãy chọn ngày",
      term: "Hãy chọn thời hạn",
      quantity: "Số quyển phải từ 1 trở lên",
      reason: "Lý do tối thiểu 10 ký tự",
    });

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

  it("từ chối ngày quá khứ và số lượng vượt tồn kho", () => {
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

  it("từ chối số quyển không phải số nguyên dương", () => {
    expect(
      validateLoan({ ...validInput, quantity: "1.5" }, db.books).quantity,
    ).toBe("Số quyển phải từ 1 trở lên");
    expect(
      validateLoan({ ...validInput, quantity: "-1" }, db.books).quantity,
    ).toBe("Số quyển phải từ 1 trở lên");
  });
});
