# Admin dashboard — DORMANT

This folder is prefixed with `_` so Next.js App Router treats it as a
private folder and does **not** register any routes from it. The code
still type-checks and compiles, it's just not reachable.

## To reactivate

Rename both folders back, then redeploy:

```bash
git mv src/app/_admin src/app/admin
git mv src/app/api/_admin src/app/api/admin
```

## What's still set up even while dormant

- `admins`, `orders`, `order_items`, `order_status_history` tables in
  the Neon DB
- `holy14@protonmail.com` seeded as the initial admin
- `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` env vars in Vercel
  (Production + Development)
- `src/lib/auth.ts` and `src/lib/order-transitions.ts` (used by
  nothing while dormant; harmless)
- The `/api/orders` checkout endpoint and `/api/webhooks/flot` are
  **still active** — orders continue to land in the DB even with the
  dashboard turned off.

So reactivation is purely a rename. No schema work, no env-var work,
no data migration. The orders that accumulate while dormant will all
be visible the moment the routes come back.

## Why dormant instead of deleted

Switching to a third-party order-management dashboard via merchant ID,
but keeping this in case the third-party tool doesn't fit. Deleting
the code would mean rebuilding from scratch later — there's no upside
when an underscore prefix achieves the same goal.

See [admin-dashboard-playbook.md](../../../admin-dashboard-playbook.md)
in the repo root for the full architecture.
