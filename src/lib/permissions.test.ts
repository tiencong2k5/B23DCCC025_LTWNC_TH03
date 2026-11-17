import { describe, expect, it } from "vitest";
import { can } from "./permissions";

describe("role permissions", () => {
  it("matches the student and guest permissions", () => {
    expect(can(undefined, "book:view")).toBe(true);
    expect(can(undefined, "loan:create")).toBe(false);
    expect(can(undefined, "loan:view-own")).toBe(false);
    expect(can(undefined, "loan:view-all")).toBe(false);
    expect(can(undefined, "loan:review")).toBe(false);

    expect(can("student", "book:view")).toBe(true);
    expect(can("student", "loan:create")).toBe(true);
    expect(can("student", "loan:view-own")).toBe(true);
    expect(can("student", "loan:view-all")).toBe(false);
    expect(can("student", "loan:review")).toBe(false);
  });

  it("matches the administrator permissions", () => {
    expect(can("admin", "book:view")).toBe(true);
    expect(can("admin", "loan:create")).toBe(false);
    expect(can("admin", "loan:view-own")).toBe(false);
    expect(can("admin", "loan:view-all")).toBe(true);
    expect(can("admin", "loan:review")).toBe(true);
  });
});
