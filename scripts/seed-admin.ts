/**
 * Seed the admins table with the initial allowlisted emails.
 *
 * Usage: `npm run db:seed`
 *
 * Env vars:
 *   POSTGRES_URL             — Neon pooled connection (required)
 *   INITIAL_ADMIN_EMAILS     — optional comma-separated override
 *
 * Safe to run multiple times: uses INSERT ... ON CONFLICT DO NOTHING.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { db, admins } from "../src/lib/db";

const DEFAULT_ADMINS = ["holy14@protonmail.com"];

async function main() {
  const raw = process.env.INITIAL_ADMIN_EMAILS;
  const emails = raw
    ? raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    : DEFAULT_ADMINS;

  if (emails.length === 0) {
    console.log("No admin emails to seed — nothing to do.");
    return;
  }

  console.log(`Seeding ${emails.length} admin(s):`, emails.join(", "));

  const result = await db
    .insert(admins)
    .values(
      emails.map((email) => ({
        email,
        addedBy: "seed-script",
      }))
    )
    .onConflictDoNothing({ target: admins.email })
    .returning();

  console.log(`Inserted ${result.length} new admin(s).`);
  if (result.length < emails.length) {
    console.log(
      `(${emails.length - result.length} already existed — left untouched.)`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
