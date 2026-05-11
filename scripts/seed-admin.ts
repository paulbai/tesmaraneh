/**
 * Seed the admins table with the initial admin phone numbers.
 *
 * Usage: `npm run db:seed`
 *
 * Env vars:
 *   POSTGRES_URL             — Neon pooled connection (required)
 *   INITIAL_ADMIN_PHONES     — optional comma-separated override
 *
 * Safe to run multiple times: uses INSERT ... ON CONFLICT DO NOTHING.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { db, admins } from "../src/lib/db";

const DEFAULT_PHONES: string[] = [];

async function main() {
  const raw = process.env.INITIAL_ADMIN_PHONES;
  const phones = raw
    ? raw
        .split(",")
        .map((p) => p.trim().replace(/[\s\-()]/g, "").replace(/^\+/, ""))
        .filter(Boolean)
    : DEFAULT_PHONES;

  if (phones.length === 0) {
    console.log("No admin phones to seed — set INITIAL_ADMIN_PHONES.");
    return;
  }

  console.log(`Seeding ${phones.length} admin(s):`, phones.join(", "));

  const result = await db
    .insert(admins)
    .values(
      phones.map((phone) => ({
        phone,
        label: "Owner",
        addedBy: "seed-script",
      }))
    )
    .onConflictDoNothing({ target: admins.phone })
    .returning();

  console.log(`Inserted ${result.length} new admin(s).`);
  if (result.length < phones.length) {
    console.log(
      `(${phones.length - result.length} already existed — left untouched.)`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
