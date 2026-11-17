"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [errorMessage, formAction, isPending] = useActionState(loginAction, "");

  return (
    <section className="content-card login-card">
      <h1>Đăng nhập</h1>
      <form action={formAction} className="login-form">
        <input name="callbackUrl" type="hidden" value={callbackUrl} />
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            autoComplete="email"
            id="email"
            name="email"
            required
            type="email"
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Mật khẩu</label>
          <input
            autoComplete="current-password"
            id="password"
            name="password"
            required
            type="password"
          />
        </div>
        {errorMessage ? <p role="alert">{errorMessage}</p> : null}
        <button disabled={isPending} type="submit">
          {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </section>
  );
}
