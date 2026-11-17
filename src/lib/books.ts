import { db } from "@/lib/db";
import type { Book, Category } from "@/types";

export async function loadBooksShift(filters: {
  category?: Category;
  q?: string;
} = {}): Promise<Book[]> {
  await new Promise<void>((resolve) => setTimeout(resolve, 800));

  const query = filters.q?.trim().toLocaleLowerCase("vi");
  return db.books.filter((book) => {
    const matchesCategory =
      filters.category === undefined || book.category === filters.category;
    const matchesQuery =
      !query || book.title.toLocaleLowerCase("vi").includes(query);

    return matchesCategory && matchesQuery;
  });
}

export async function loadBookById(
  id: string | number,
): Promise<Book | undefined> {
  const bookId = typeof id === "number" ? id : Number(id);

  if (!Number.isInteger(bookId)) {
    return undefined;
  }

  return db.books.find((book) => book.id === bookId);
}
