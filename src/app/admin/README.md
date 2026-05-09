# Admin Dashboard — ACTIVE

Routes live at `/admin/login`, `/admin/orders`, `/admin/settings`.

## Auth

- Email + password login (`ADMIN_PASSWORD` env var)
- Allowed emails stored in `admins` table
- Session: HMAC-signed cookie (`ADMIN_SESSION_SECRET`), 7-day TTL

## SMS Notifications

When a new order is placed, SMS is sent via AppHiveSL to all numbers
in the `notification_phones` table (max 3). Manage via Settings page.

Env vars required:
- `APPHIVE_CLIENT_ID`
- `APPHIVE_CLIENT_SECRET`
- `APPHIVE_TOKEN`

## To deactivate

Rename folders back and redeploy:

```bash
git mv src/app/admin src/app/_admin
git mv src/app/api/admin src/app/api/_admin
```
