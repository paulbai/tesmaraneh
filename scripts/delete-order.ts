/**
 * Delete a single order (and cascaded items/history) by reference.
 *
 * Usage: `npx tsx scripts/delete-order.ts <reference>`
 * Meant for cleaning up test data — not exposed via the admin UI.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db, orders } from "../src/lib/db";

async function main() {
  const ref = process.argv[2];
  if (!ref) {
    console.error("Usage: tsx scripts/delete-order.ts <reference>");
    process.exit(1);
  }
  const deleted = await db
    .delete(orders)
    .where(eq(orders.reference, ref))
    .returning({ id: orders.id, ref: orders.reference });
  console.log(`Deleted ${deleted.length} order(s):`, deleted);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
