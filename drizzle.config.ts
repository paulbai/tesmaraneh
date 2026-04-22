import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load .env.local (populated by `vercel env pull .env.local`).
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Unpooled connection for migrations — Neon requires a direct TCP
    // connection rather than the pooler for DDL.
    url:
      process.env.POSTGRES_URL_NON_POOLING ??
      process.env.POSTGRES_URL ??
      "",
  },
  strict: true,
  verbose: true,
});
