"use client";

import { useActionState } from "react";
import { TERMS } from "@/data/books";
import { TERM_LABEL } from "@/lib/format";
import { today } from "@/lib/loan-validate";
import type { Book } from "@/types";
import type { LoanFormState } from "@/lib/loan-validate";

type LoanAction = (
  previousState: LoanFormState,
  formData: FormData,
) => Promise<LoanFormState>;

const EMPTY_STATE: LoanFormState = { errors: {}, values: {} };

export default function LoanForm({
  books,
  defaultBookId,
  action,
}: {
  books: Book[];
  defaultBookId?: number;
  action: LoanAction;
}) {
  const initialState: LoanFormState = {
    ...EMPTY_STATE,
    values: defaultBookId ? { bookId: String(defaultBookId) } : {},
  };
  const [state, formAction, isPending] = useActionState(action, initialState);
  const values = state.values;
  const formKey = JSON.stringify(values);

  return (
    <section className="content-card">
      <h2>Gửi yêu cầu mượn sách</h2>
      <form action={formAction} className="loan-form" key={formKey}>
        <div className="form-field">
          <label htmlFor="loan-book">Sách</label>
          <select
            aria-invalid={Boolean(state.errors.bookId)}
            defaultValue={values.bookId ?? ""}
            id="loan-book"
            name="bookId"
          >
            <option value="">-- Chọn sách --</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title} ({book.copies} bản)
              </option>
            ))}
          </select>
          {state.errors.bookId ? (
            <span role="alert">{state.errors.bookId}</span>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="loan-pickup-date">Ngày lấy sách</label>
          <input
            aria-invalid={Boolean(state.errors.pickupDate)}
            defaultValue={values.pickupDate ?? today()}
            id="loan-pickup-date"
            min={today()}
            name="pickupDate"
            type="date"
          />
          {state.errors.pickupDate ? (
            <span role="alert">{state.errors.pickupDate}</span>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="loan-term">Thời hạn mượn</label>
          <select
            aria-invalid={Boolean(state.errors.term)}
            defaultValue={values.term ?? ""}
            id="loan-term"
            name="term"
          >
            <option value="">-- Chọn thời hạn --</option>
            {TERMS.map((term) => (
              <option key={term} value={term}>
                {TERM_LABEL[term]}
              </option>
            ))}
          </select>
          {state.errors.term ? (
            <span role="alert">{state.errors.term}</span>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="loan-quantity">Số quyển</label>
          <input
            aria-invalid={Boolean(state.errors.quantity)}
            defaultValue={values.quantity ?? "1"}
            id="loan-quantity"
            min="1"
            name="quantity"
            type="number"
          />
          {state.errors.quantity ? (
            <span role="alert">{state.errors.quantity}</span>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="loan-reason">Lý do mượn</label>
          <textarea
            aria-invalid={Boolean(state.errors.reason)}
            defaultValue={values.reason ?? ""}
            id="loan-reason"
            name="reason"
            rows={3}
          />
          {state.errors.reason ? (
            <span role="alert">{state.errors.reason}</span>
          ) : null}
        </div>

        {state.message ? (
          <p role={state.ok ? "status" : "alert"}>{state.message}</p>
        ) : null}
        <button disabled={isPending} type="submit">
          {isPending ? "Đang gửi..." : "Gửi yêu cầu"}
        </button>
      </form>
    </section>
  );
}
