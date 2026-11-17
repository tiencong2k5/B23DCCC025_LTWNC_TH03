import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { can } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { index: false },
};

export default async function LoansPage() {
  const session = await auth();

  if (!can(session?.user.role, "loan:view-own")) {
    redirect("/forbidden");
  }

  return (
    <section className="content-card">
      <h2>Sách đã mượn</h2>
    </section>
  );
}
