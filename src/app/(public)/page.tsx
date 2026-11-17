import Link from "next/link";
import { db } from "@/lib/db";

export default function HomePage() {
  const categoryCount = new Set(db.books.map((book) => book.category)).size;

  return (
    <section className="content-card">
      <h1>Thư viện khoa CNTT PTIT</h1>
      <p>
        {db.books.length} đầu sách · {categoryCount} chuyên mục
      </p>
      <Link className="button-link" href="/books">
        Xem danh mục sách
      </Link>
    </section>
  );
}
