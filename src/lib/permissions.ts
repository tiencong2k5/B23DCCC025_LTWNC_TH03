import type { Role } from "@/types";

export type Action =
  | "book:view"
  | "loan:create"
  | "loan:view-own"
  | "loan:view-all"
  | "loan:review";

const permissions: Record<Role, readonly Action[]> = {
  student: ["book:view", "loan:create", "loan:view-own"],
  admin: ["book:view", "loan:view-all", "loan:review"],
};

export function can(role: Role | undefined, action: Action): boolean {
  if (action === "book:view") {
    return true;
  }

  return role !== undefined && permissions[role].includes(action);
}
