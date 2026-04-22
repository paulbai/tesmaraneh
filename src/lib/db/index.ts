import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/** Lazy DB client. We cannot instantiate `drizzle()` at module-load because
 *  `next build`'s page-data collector imports every route (including API
 *  routes that touch the DB) before env vars are guaranteed to be present —
 *  and it's valuable to be able to build without a DB configured.
 *
 *  Connection is deferred until the first property access on `db`, which
 *  means a request actually hit a route that uses it. */

type Db = ReturnType<typeof drizzle<typeof schema>>;
let _db: Db | null = null;

function getDb(): Db {
  if (_db) return _db;
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Missing POSTGRES_URL — ensure the Neon integration is connected to this Vercel project and env vars are pulled locally (vercel env pull .env.local)."
    );
  }
  _db = drizzle(neon(url), { schema });
  return _db;
}

export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const target = getDb() as unknown as Record<string | symbol, unknown>;
    const value = target[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(target)
      : value;
  },
});

export * from "./schema";
