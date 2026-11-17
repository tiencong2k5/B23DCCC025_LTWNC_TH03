import type { ReactNode } from "react";

export default function MemberLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <section className="member-area">
      <h1>Khu vực thành viên</h1>
      {children}
    </section>
  );
}
