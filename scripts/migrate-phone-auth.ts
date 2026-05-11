/**
 * Migrate the database from email-based admin auth to phone-based SMS OTP auth.
 *
 * Changes:
 * 1. admins table: add `phone` (text, unique), `label` (text), make `email` nullable,
 *    add `added_by`, `last_login_at` columns if missing
 * 2. Create `admin_otps` table (phone-based OTP storage)
 * 3. Create `notification_phones` table
 * 4. Clean up old data (remove email-only admins without phone numbers)
 *
 * Usage: npx tsx scripts/migrate-phone-auth.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error("Missing POSTGRES_URL");
  process.exit(1);
}

const sql = neon(url);

async function main() {
  console.log("Starting phone-auth migration...\n");

  // 1. Check if admins table exists and what columns it has
  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'admins'
    ORDER BY ordinal_position
  `;
  const colNames = cols.map((c) => c.column_name as string);
  console.log("Current admins columns:", colNames.join(", "));

  // Add phone column if missing
  if (!colNames.includes("phone")) {
    console.log("Adding phone column to admins...");
    // First add as nullable
    await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS phone text`;
    // Add unique constraint
    try {
      await sql`ALTER TABLE admins ADD CONSTRAINT admins_phone_unique UNIQUE (phone)`;
    } catch {
      console.log("  (phone unique constraint already exists)");
    }
  }

  // Add label column if missing
  if (!colNames.includes("label")) {
    console.log("Adding label column to admins...");
    await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS label text`;
  }

  // Add added_by column if missing
  if (!colNames.includes("added_by")) {
    console.log("Adding added_by column to admins...");
    await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS added_by text`;
  }

  // Add added_at column if missing
  if (!colNames.includes("added_at")) {
    console.log("Adding added_at column to admins...");
    await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS added_at timestamptz DEFAULT now() NOT NULL`;
  }

  // Add last_login_at column if missing
  if (!colNames.includes("last_login_at")) {
    console.log("Adding last_login_at column to admins...");
    await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS last_login_at timestamptz`;
  }

  // Make email nullable if it isn't already
  console.log("Ensuring email is nullable...");
  await sql`ALTER TABLE admins ALTER COLUMN email DROP NOT NULL`;

  // Remove old admins that have no phone set (they can't login anymore)
  const oldAdmins = await sql`SELECT id, email FROM admins WHERE phone IS NULL`;
  if (oldAdmins.length > 0) {
    console.log(`Removing ${oldAdmins.length} admin(s) without phone numbers:`);
    for (const a of oldAdmins) {
      console.log(`  - ${a.email}`);
    }
    await sql`DELETE FROM admins WHERE phone IS NULL`;
  }

  // Now make phone NOT NULL
  console.log("Making phone NOT NULL...");
  await sql`ALTER TABLE admins ALTER COLUMN phone SET NOT NULL`;

  // 2. Create admin_otps table
  console.log("\nCreating admin_otps table...");
  await sql`
    CREATE TABLE IF NOT EXISTS admin_otps (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      phone text NOT NULL,
      code text NOT NULL,
      expires_at timestamptz NOT NULL,
      used boolean DEFAULT false NOT NULL,
      created_at timestamptz DEFAULT now() NOT NULL
    )
  `;
  try {
    await sql`CREATE INDEX IF NOT EXISTS admin_otps_phone_idx ON admin_otps (phone)`;
  } catch {
    console.log("  (phone index already exists)");
  }

  // 3. Create notification_phones table
  console.log("Creating notification_phones table...");
  await sql`
    CREATE TABLE IF NOT EXISTS notification_phones (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      phone text NOT NULL UNIQUE,
      label text,
      added_by text,
      added_at timestamptz DEFAULT now() NOT NULL
    )
  `;

  // 4. Clean up any old email-based OTP table if it exists
  const otpCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'admin_otps'
    ORDER BY ordinal_position
  `;
  const otpColNames = otpCols.map((c) => c.column_name as string);
  if (otpColNames.includes("email") && !otpColNames.includes("phone")) {
    console.log("Renaming email column to phone in admin_otps...");
    await sql`ALTER TABLE admin_otps RENAME COLUMN email TO phone`;
  }

  // Drop old email-based unique constraint on admins if exists
  try {
    await sql`ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_email_unique`;
  } catch {
    // ignore
  }

  console.log("\n✓ Migration complete!");

  // Show current state
  const adminRows = await sql`SELECT id, phone, email, label FROM admins`;
  console.log(`\nCurrent admins (${adminRows.length}):`);
  for (const a of adminRows) {
    console.log(`  ${a.phone} ${a.label ? `(${a.label})` : ""} ${a.email ? `<${a.email}>` : ""}`);
  }

  if (adminRows.length === 0) {
    console.log("\n⚠ No admins exist! Set INITIAL_ADMIN_PHONES and run: npx tsx scripts/seed-admin.ts");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
