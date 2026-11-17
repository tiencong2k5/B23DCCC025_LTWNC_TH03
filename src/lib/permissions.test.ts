import { describe, expect, it } from "vitest";
import { can } from "./permissions";

describe("ma trận phân quyền", () => {
  it("cho phép khách chỉ xem sách", () => {
    expect(can(undefined, "book:view")).toBe(true);
    expect(can(undefined, "loan:create")).toBe(false);
    expect(can(undefined, "loan:view-own")).toBe(false);
    expect(can(undefined, "loan:view-all")).toBe(false);
    expect(can(undefined, "loan:review")).toBe(false);
  });

  it("cho phép sinh viên tạo và xem yêu cầu của mình nhưng không duyệt", () => {
    expect(can("student", "book:view")).toBe(true);
    expect(can("student", "loan:create")).toBe(true);
    expect(can("student", "loan:view-own")).toBe(true);
    expect(can("student", "loan:view-all")).toBe(false);
    expect(can("student", "loan:review")).toBe(false);
  });

  it("cho phép quản trị viên xem tất cả và duyệt nhưng không tạo yêu cầu", () => {
    expect(can("admin", "book:view")).toBe(true);
    expect(can("admin", "loan:create")).toBe(false);
    expect(can("admin", "loan:view-own")).toBe(false);
    expect(can("admin", "loan:view-all")).toBe(true);
    expect(can("admin", "loan:review")).toBe(true);
  });
});
