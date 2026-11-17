"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";

export async function reviewLoan(formData: FormData): Promise<void> {
  const session = await auth();

  if (!can(session?.user.role, "loan:review")) {
    throw new Error("Không có quyền");
  }

  const rawId = formData.get("id");
  const rawStatus = formData.get("status");

  if (typeof rawId !== "string" || !/^\d+$/.test(rawId)) {
    throw new Error("Yêu cầu mượn không hợp lệ");
  }

  if (rawStatus !== "approved" && rawStatus !== "rejected") {
    throw new Error("Trạng thái duyệt không hợp lệ");
  }

  const loan = db.loans.find((item) => item.id === Number(rawId));

  if (loan?.status === "pending") {
    loan.status = rawStatus;
    revalidatePath("/admin");
  }
}
