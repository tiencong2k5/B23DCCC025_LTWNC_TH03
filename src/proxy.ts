import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { can } from "@/lib/permissions";

export default auth((request) => {
  const pathname = request.nextUrl.pathname;

  if (!request.auth) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  if (
    pathname.startsWith("/admin") &&
    !can(request.auth.user?.role, "loan:view-all")
  ) {
    return NextResponse.redirect(new URL("/forbidden", request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/loans/:path*", "/admin/:path*"],
};
