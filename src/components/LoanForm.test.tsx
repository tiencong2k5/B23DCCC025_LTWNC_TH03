import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { toLoanInput, type LoanFormState } from "@/lib/loan-validate";
import LoanForm from "./LoanForm";

describe("biểu mẫu mượn sách", () => {
  it("hiện lỗi đúng trường và giữ lại dữ liệu đã nhập", async () => {
    const user = userEvent.setup();
    const action = vi.fn(
      async (_previousState: LoanFormState, formData: FormData) => ({
        errors: { reason: "Lý do tối thiểu 10 ký tự" },
        values: toLoanInput(formData),
      }),
    );

    render(
      <LoanForm books={db.books} defaultBookId={6} action={action} />,
    );

    await user.selectOptions(screen.getByLabelText("Sách"), "6");
    fireEvent.change(screen.getByLabelText("Ngày lấy sách"), {
      target: { value: "2099-01-01" },
    });
    await user.selectOptions(screen.getByLabelText("Thời hạn mượn"), "14");
    await user.clear(screen.getByLabelText("Số quyển"));
    await user.type(screen.getByLabelText("Số quyển"), "1");
    await user.type(screen.getByLabelText("Lý do mượn"), "Ngắn");
    await user.click(screen.getByRole("button", { name: "Gửi yêu cầu" }));

    expect(await screen.findByText("Lý do tối thiểu 10 ký tự")).toHaveAttribute(
      "role",
      "alert",
    );
    await waitFor(() => {
      expect(screen.getByLabelText("Sách")).toHaveValue("6");
      expect(screen.getByLabelText("Ngày lấy sách")).toHaveValue("2099-01-01");
      expect(screen.getByLabelText("Thời hạn mượn")).toHaveValue("14");
      expect(screen.getByLabelText("Số quyển")).toHaveValue(1);
      expect(screen.getByLabelText("Lý do mượn")).toHaveValue("Ngắn");
    });
  });

  it("gửi các giá trị đã chọn trong FormData và xóa form sau thành công", async () => {
    const user = userEvent.setup();
    const action = vi.fn(
      async (previousState: LoanFormState, formData: FormData) => {
        expect(previousState.errors).toEqual({});
        expect(formData.get("bookId")).toBe("6");
        return {
          errors: {},
          values: {},
          message: "Đã gửi yêu cầu, chờ duyệt",
          ok: true,
        };
      },
    );

    render(<LoanForm books={db.books} action={action} />);

    await user.selectOptions(screen.getByLabelText("Sách"), "6");
    fireEvent.change(screen.getByLabelText("Ngày lấy sách"), {
      target: { value: "2099-01-01" },
    });
    await user.selectOptions(screen.getByLabelText("Thời hạn mượn"), "14");
    await user.clear(screen.getByLabelText("Số quyển"));
    await user.type(screen.getByLabelText("Số quyển"), "1");
    await user.type(screen.getByLabelText("Lý do mượn"), "Ôn tập môn học");
    await user.click(screen.getByRole("button", { name: "Gửi yêu cầu" }));

    await screen.findByRole("status");
    expect(action).toHaveBeenCalledTimes(1);
    const formData = action.mock.calls[0][1];
    expect(formData.get("bookId")).toBe("6");
    expect(formData.get("pickupDate")).toBe("2099-01-01");
    expect(formData.get("term")).toBe("14");
    expect(formData.get("quantity")).toBe("1");
    expect(formData.get("reason")).toBe("Ôn tập môn học");
    expect(screen.getByLabelText("Sách")).toHaveValue("");
    expect(screen.getByLabelText("Lý do mượn")).toHaveValue("");
  });

  it("giữ lý do và hiển thị thông báo khi sách đã hết bản", async () => {
    const user = userEvent.setup();
    const action = vi.fn(
      async (_state: LoanFormState, formData: FormData) => ({
        errors: {},
        values: toLoanInput(formData),
        message: "Sách đã hết bản vào ngày này",
      }),
    );

    render(
      <LoanForm books={db.books} defaultBookId={6} action={action} />,
    );
    await user.type(screen.getByLabelText("Lý do mượn"), "Ôn tập môn học");
    await user.click(screen.getByRole("button", { name: "Gửi yêu cầu" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sách đã hết bản vào ngày này",
    );
    expect(screen.getByLabelText("Lý do mượn")).toHaveValue("Ôn tập môn học");
  });

  it("chọn sẵn sách theo defaultBookId", () => {
    render(
      <LoanForm
        books={db.books}
        defaultBookId={6}
        action={vi.fn(async (previousState: LoanFormState) => {
          expect(previousState.values).toEqual({ bookId: "6" });
          return { errors: {}, values: {} };
        })}
      />,
    );

    expect(screen.getByLabelText("Sách")).toHaveValue("6");
  });
});
