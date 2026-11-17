import { afterEach, describe, expect, it, vi } from "vitest";
import { loadBookById, loadBooksShift } from "./books";

afterEach(() => {
  vi.useRealTimers();
});

describe("hàm lấy dữ liệu sách", () => {
  it("chờ 800 mili giây rồi lọc theo chuyên mục và tên không phân biệt hoa thường", async () => {
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

  it("tìm sách theo mã và trả về rỗng với mã không hợp lệ", async () => {
    await expect(loadBookById("6")).resolves.toMatchObject({
      id: 6,
      title: "An toàn mạng",
    });
    await expect(loadBookById("invalid")).resolves.toBeUndefined();
  });
});
