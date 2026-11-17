import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { can } from "@/lib/permissions";
import { TERM_LABEL } from "@/lib/format";
import type { LoanStatus } from "@/types";
import { reviewLoan } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { index: false },
};

const REVIEW_STATUSES = [
  { value: "approved", label: "Duyệt" },
  { value: "rejected", label: "Từ chối" },
] as const;

export default async function AdminPage() {
  const session = await auth();

  if (!can(session?.user.role, "loan:view-all")) {
    redirect("/forbidden");
  }

  const counts: Record<LoanStatus, number> = {
    pending: db.loans.filter((loan) => loan.status === "pending").length,
    approved: db.loans.filter((loan) => loan.status === "approved").length,
    rejected: db.loans.filter((loan) => loan.status === "rejected").length,
  };
  const pendingLoans = db.loans.filter((loan) => loan.status === "pending");

  return (
    <section className="content-card">
      <h2>Duyệt yêu cầu mượn</h2>
      <p>
        Chờ duyệt: {counts.pending} | Đã duyệt: {counts.approved} | Từ chối:{" "}
        {counts.rejected}
      </p>
      {pendingLoans.length === 0 ? (
        <p>Không có yêu cầu đang chờ duyệt.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col">Tên sách</th>
                <th scope="col">Ngày lấy</th>
                <th scope="col">Thời hạn</th>
                <th scope="col">Email người mượn</th>
                <th scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pendingLoans.map((loan) => {
                const book = db.books.find((item) => item.id === loan.bookId);

                return (
                  <tr key={loan.id}>
                    <td>{book?.title ?? "Sách không còn trong danh mục"}</td>
                    <td>{formatDate(loan.pickupDate)}</td>
                    <td>{TERM_LABEL[loan.term]}</td>
                    <td>{loan.userEmail}</td>
                    <td>
                      <div className="loan-actions">
                        {REVIEW_STATUSES.map((status) => (
                          <form action={reviewLoan} key={status.value}>
                            <input name="id" type="hidden" value={loan.id} />
                            <input
                              name="status"
                              type="hidden"
                              value={status.value}
                            />
                            <button
                              className={
                                status.value === "rejected"
                                  ? "button-danger"
                                  : undefined
                              }
                              type="submit"
                            >
                              {status.label}
                            </button>
                          </form>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
