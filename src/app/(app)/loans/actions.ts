"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import {
  toLoanData,
  toLoanInput,
  validateLoan,
} from "@/lib/loan-validate";
import type { LoanFormState } from "@/lib/loan-validate";
import { cancelLoan, submitLoan } from "@/lib/loans";

export async function createLoanAction(
  _previousState: LoanFormState,
  formData: FormData,
): Promise<LoanFormState> {
  const session = await auth();

  if (
    !session ||
    !can(session.user.role, "loan:create") ||
    !session.user.email
  ) {
    throw new Error("Không có quyền");
  }

  const input = toLoanInput(formData);
  const errors = validateLoan(input, db.books);

  if (Object.keys(errors).length > 0) {
    return { errors, values: input };
  }

  const result = submitLoan(session.user.email, toLoanData(input));

  if (!result.ok) {
    return {
      errors: {},
      values: input,
      message: result.message,
    };
  }

  revalidatePath("/loans");
  return {
    errors: {},
    values: {},
    message: "Đã gửi yêu cầu, chờ duyệt",
    ok: true,
  };
}

export async function cancelLoanAction(id: number): Promise<void> {
  const session = await auth();

  if (
    !session ||
    !can(session.user.role, "loan:view-own") ||
    !session.user.email
  ) {
    throw new Error("Không có quyền");
  }

  const result = cancelLoan(session.user.email, id);

  if (result === "ok") {
    revalidatePath("/loans");
  }
}
