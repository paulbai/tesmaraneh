import { db } from "@/lib/db";
import { notificationPhones } from "@/lib/db/schema";
import { PhoneManager } from "./phone-manager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const phones = await db.select().from(notificationPhones);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Manage notification preferences
        </p>
      </div>

      <section className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <header className="px-5 py-4 border-b border-stone-200 bg-stone-50/50">
          <h2 className="text-sm font-semibold text-stone-900">
            SMS Order Notifications
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Add up to 3 phone numbers to receive an SMS when a new order is
            placed. Use full international format (e.g. 23230123456).
          </p>
        </header>
        <div className="p-5">
          <PhoneManager initialPhones={phones} />
        </div>
      </section>
    </div>
  );
}
