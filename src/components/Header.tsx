"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;
    void update();
  }, [pathname, update]);

  return (
    <header className="site-header">
      <nav aria-label="Điều hướng chính">
        <Link href="/">Trang chủ</Link>
        <Link href="/books">Sách</Link>
        {status === "loading" ? null : user ? (
          <>
            <Link href="/loans">Sách đã mượn</Link>
            {user.role === "admin" ? <Link href="/admin">Quản trị</Link> : null}
            <span className="nav-greeting">
              Xin chào, {user.name} ({user.role})
            </span>
            <button
              className="nav-button"
              onClick={() => signOut({ redirectTo: "/" })}
              type="button"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <Link href="/login">Đăng nhập</Link>
        )}
      </nav>
    </header>
  );
}
