"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

function getCallbackUrl(value: FormDataEntryValue | null): string {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
  ) {
    return value;
  }

  return "/loans";
}

export async function loginAction(
  _previousState: string,
  formData: FormData,
): Promise<string> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return "Vui lòng nhập email và mật khẩu.";
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: getCallbackUrl(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Email hoặc mật khẩu không đúng.";
    }

    throw error;
  }

  return "";
}
