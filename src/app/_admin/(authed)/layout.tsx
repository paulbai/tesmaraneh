import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { LogoutButton } from "./_components/logout-button";

export const dynamic = "force-dynamic";

export default async function AuthedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/orders" className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--terracotta)]" />
              <span className="font-semibold tracking-tight">
                Tesmaraneh Admin
              </span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              <Link
                href="/admin/orders"
                className="px-3 py-1.5 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                Orders
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-stone-500">
              {admin.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
