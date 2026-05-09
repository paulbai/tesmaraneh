import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/admin/orders");
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[var(--terracotta)]" />
              <span className="text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase">
                Tesmaraneh Admin
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Access the order dashboard.
            </p>
          </div>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-stone-400">
          Authorized staff only. All actions are logged.
        </p>
      </div>
    </div>
  );
}
