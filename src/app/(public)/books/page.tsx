import Link from "next/link";
import { CATEGORIES } from "@/data/books";
import { loadBooksShift } from "@/lib/books";
import type { Category } from "@/types";

type BooksPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function isCategory(value: string): value is Category {
  return CATEGORIES.some((category) => category === value);
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams;
  const rawCategory = params.category;
  const category =
    typeof rawCategory === "string" && isCategory(rawCategory)
      ? rawCategory
      : undefined;
  const q = typeof params.q === "string" ? params.q : "";
  const books = await loadBooksShift({ category, q });
  const renderedAt = new Date().toLocaleTimeString("vi-VN", {
    hour12: false,
  });

  return (
    <section className="content-card">
      <h1>Danh mục sách</h1>
      <form className="filter-form" action="/books" method="get">
        <div className="form-field">
          <label htmlFor="book-search">Tìm sách</label>
          <input id="book-search" name="q" type="search" defaultValue={q} />
        </div>
        <div className="form-field">
          <label htmlFor="book-category">Chuyên mục</label>
          <select
            id="book-category"
            name="category"
            defaultValue={category ?? ""}
          >
            <option value="">Tất cả</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Lọc</button>
      </form>

      <p>Tìm thấy {books.length} sách</p>
      <p>Render lúc: {renderedAt}</p>

      {books.length === 0 ? (
        <p>Không tìm thấy sách nào.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col">Tên sách</th>
                <th scope="col">Tác giả</th>
                <th scope="col">Số bản</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>
                    <Link href={`/books/${book.id}`}>{book.title}</Link>
                  </td>
                  <td>{book.author}</td>
                  <td>{book.copies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
