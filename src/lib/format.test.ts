import { describe, expect, it } from "vitest";
import { formatDate, STATUS_LABEL, TERM_LABEL } from "./format";

describe("định dạng dữ liệu hiển thị", () => {
  it("đổi ngày ISO sang ngày tháng năm", () => {
    expect(formatDate("2026-12-02")).toBe("02/12/2026");
  });

  it("cung cấp nhãn tiếng Việt cho thời hạn và trạng thái", () => {
    expect(TERM_LABEL[7]).toBe("7 ngày");
    expect(TERM_LABEL[14]).toBe("14 ngày");
    expect(TERM_LABEL[30]).toBe("30 ngày");
    expect(STATUS_LABEL.pending).toBe("Chờ duyệt");
    expect(STATUS_LABEL.approved).toBe("Đã duyệt");
    expect(STATUS_LABEL.rejected).toBe("Từ chối");
  });
});
