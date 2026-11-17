import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadBookById, loadBooksShift } from "@/lib/books";

export const revalidate = 60;

type BookPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const books = await loadBooksShift();
  return books.slice(0, 12).map((book) => ({ id: String(book.id) }));
}

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await loadBookById(id);

  if (!book) {
    return { title: "Không tìm thấy sách" };
  }

  return {
    title: `${book.title} – ${book.author}`,
    description: `Sách ${book.category}, thư viện có ${book.copies} bản.`,
  };
}

export default async function BookDetailsPage({ params }: BookPageProps) {
  const { id } = await params;
  const book = await loadBookById(id);

  if (!book) {
    notFound();
  }

  const renderedAt = new Date().toLocaleTimeString("vi-VN", {
    hour12: false,
  });

  return (
    <article className="content-card">
      <h1>{book.title}</h1>
      <p>Tác giả: {book.author}</p>
      <p>Chuyên mục: {book.category}</p>
      <p>Số bản: {book.copies}</p>
      <p>Cập nhật lúc: {renderedAt}</p>
      <Link className="button-link" href={`/loans?book=${book.id}`}>
        Mượn sách này
      </Link>
    </article>
  );
}
