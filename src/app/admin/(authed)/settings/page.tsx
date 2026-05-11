import { db } from "@/lib/db";
import { admins, notificationPhones } from "@/lib/db/schema";
import { PhoneManager } from "./phone-manager";
import { AdminManager } from "./admin-manager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [adminRows, notifPhones] = await Promise.all([
    db.select().from(admins),
    db.select().from(notificationPhones),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Manage admin access and notification preferences
        </p>
      </div>

      {/* Admin Users */}
      <section className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <header className="px-5 py-4 border-b border-stone-200 bg-stone-50/50">
          <h2 className="text-sm font-semibold text-stone-900">
            Admin Users
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Phone numbers that can sign in to this dashboard. They will
            receive an SMS code to verify their identity.
          </p>
        </header>
        <div className="p-5">
          <AdminManager initialAdmins={adminRows} />
        </div>
      </section>

      {/* SMS Order Notifications */}
      <section className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <header className="px-5 py-4 border-b border-stone-200 bg-stone-50/50">
          <h2 className="text-sm font-semibold text-stone-900">
            SMS Order Notifications
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Add up to 3 phone numbers to receive an SMS when a new order is
            placed. Include country code (e.g. +23275696192).
          </p>
        </header>
        <div className="p-5">
          <PhoneManager initialPhones={notifPhones} />
        </div>
      </section>
    </div>
  );
}
