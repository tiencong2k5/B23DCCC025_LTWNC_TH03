"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export default function SessionWrapper({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <SessionProvider>{children}</SessionProvider>;
}
