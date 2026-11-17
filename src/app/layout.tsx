const BUILD_TAG = "rb-6129";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import SessionWrapper from "@/components/SessionWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Thư viện khoa CNTT",
    template: "%s | Thư viện khoa",
  },
  description: "Tra cứu sách và tài liệu tại Thư viện khoa CNTT PTIT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="vi" data-build-tag={BUILD_TAG}>
      <body>
        <SessionWrapper>
          <Header />
          <main className="site-main">{children}</main>
        </SessionWrapper>
      </body>
    </html>
  );
}
