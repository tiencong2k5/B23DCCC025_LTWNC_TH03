import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { toLoanInput, type LoanFormState } from "@/lib/loan-validate";
import LoanForm from "./LoanForm";

describe("LoanForm", () => {
  it("keeps entered values and shows field errors returned by its action", async () => {
    const action = vi.fn(
      async (_previousState: LoanFormState, formData: FormData) => ({
        errors: { reason: "Lý do tối thiểu 10 ký tự" },
        values: toLoanInput(formData),
      }),
    );

    render(
      <LoanForm books={db.books} defaultBookId={6} action={action} />,
    );

    fireEvent.change(screen.getByLabelText("Sách"), {
      target: { value: "6" },
    });
    fireEvent.change(screen.getByLabelText("Ngày lấy sách"), {
      target: { value: "2099-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Thời hạn mượn"), {
      target: { value: "14" },
    });
    fireEvent.change(screen.getByLabelText("Số quyển"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Lý do mượn"), {
      target: { value: "Ngắn" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Gửi yêu cầu" }));

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
});
