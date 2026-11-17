import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoanForm from "@/components/LoanForm";
import { db } from "@/lib/db";
import { formatDate, STATUS_LABEL, TERM_LABEL } from "@/lib/format";
import { can } from "@/lib/permissions";
import { listLoans, parseStatus } from "@/lib/loans";
import { cancelLoanAction, createLoanAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { index: false },
};

type LoansPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function getSingleValue(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function getPage(value: string): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

export default async function LoansPage({ searchParams }: LoansPageProps) {
  const session = await auth();

  if (!session?.user.email) {
    redirect("/forbidden");
  }

  const role = session.user.role;
  const canViewOwn = can(role, "loan:view-own");
  const canViewAll = can(role, "loan:view-all");

  if (!canViewOwn && !canViewAll) {
    redirect("/forbidden");
  }

  const params = await searchParams;
  const status = parseStatus(getSingleValue(params.status));
  const pageNumber = getPage(getSingleValue(params.page));
  const defaultBookValue = getSingleValue(params.book);
  const defaultBookId = db.books.some(
    (book) => String(book.id) === defaultBookValue,
  )
    ? Number(defaultBookValue)
    : undefined;
  const viewer = { email: session.user.email, role };
  const loanList = listLoans(viewer, status, pageNumber);
  const paginationUrl = (page: number) => {
    const query = new URLSearchParams();
    if (status) {
      query.set("status", status);
    }
    query.set("page", String(page));
    return `/loans?${query.toString()}`;
  };

  return (
    <>
      <section className="content-card">
        <h1>Sách đã mượn</h1>
        <form action="/loans" className="filter-form" method="get">
          <div className="form-field">
            <label htmlFor="loan-status">Trạng thái</label>
            <select
              defaultValue={status}
              id="loan-status"
              name="status"
            >
              <option value="">Tất cả</option>
              <option value="pending">{STATUS_LABEL.pending}</option>
              <option value="approved">{STATUS_LABEL.approved}</option>
              <option value="rejected">{STATUS_LABEL.rejected}</option>
            </select>
          </div>
          <button type="submit">Lọc</button>
        </form>

        {loanList.items.length === 0 ? (
          <p>Không có yêu cầu mượn sách.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th scope="col">Tên sách</th>
                  <th scope="col">Ngày lấy</th>
                  <th scope="col">Thời hạn</th>
                  <th scope="col">Số quyển</th>
                  <th scope="col">Trạng thái</th>
                  {canViewOwn ? <th scope="col">Thao tác</th> : null}
                </tr>
              </thead>
              <tbody>
                {loanList.items.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.bookTitle}</td>
                    <td>{formatDate(loan.pickupDate)}</td>
                    <td>{TERM_LABEL[loan.term]}</td>
                    <td>{loan.quantity} quyển</td>
                    <td>{STATUS_LABEL[loan.status]}</td>
                    {canViewOwn ? (
                      <td>
                        {loan.status === "pending" ? (
                          <form action={cancelLoanAction.bind(null, loan.id)}>
                            <button className="button-danger" type="submit">
                              Hủy
                            </button>
                          </form>
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <nav aria-label="Phân trang" className="pagination">
          {loanList.page > 1 ? (
            <Link href={paginationUrl(loanList.page - 1)}>Trước</Link>
          ) : (
            <span>Trước</span>
          )}
          <span>
            Trang {loanList.page}/{loanList.totalPages}
          </span>
          {loanList.page < loanList.totalPages ? (
            <Link href={paginationUrl(loanList.page + 1)}>Sau</Link>
          ) : (
            <span>Sau</span>
          )}
        </nav>
      </section>

      {canViewOwn ? (
        <LoanForm
          action={createLoanAction}
          books={db.books}
          defaultBookId={defaultBookId}
        />
      ) : null}
    </>
  );
}
