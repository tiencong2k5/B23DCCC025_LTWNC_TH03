import { afterEach, describe, expect, it, vi } from "vitest";
import { loadBookById, loadBooksShift } from "./books";

afterEach(() => {
  vi.useRealTimers();
});

describe("book data helpers", () => {
  it("waits 800ms and filters by category and case-insensitive title", async () => {
    vi.useFakeTimers();

    const pendingBooks = loadBooksShift({
      category: "Mạng máy tính",
      q: "AN TOÀN",
    });
    let isResolved = false;
    void pendingBooks.then(() => {
      isResolved = true;
    });

    await vi.advanceTimersByTimeAsync(799);
    expect(isResolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(pendingBooks).resolves.toMatchObject([
      { id: 6, title: "An toàn mạng" },
    ]);
  });

  it("returns a book by id and rejects invalid ids", async () => {
    await expect(loadBookById("6")).resolves.toMatchObject({
      id: 6,
      title: "An toàn mạng",
    });
    await expect(loadBookById("invalid")).resolves.toBeUndefined();
  });
});
