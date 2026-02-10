# Registro Torneo MVP

Lean MVP tournament registration for Tres Palapas.

## Features in scope
- Public tournament landing page and registration flow.
- Admin CRUD for tournaments and divisions.
- Admin registration list with division filter.
- CSV exports (division and master).
- Confirmation email via SMTP (with graceful fallback when SMTP is missing).
- Payment mode: pay at desk / invoice later (`payment_status=unpaid`).

## Environment variables
Create a `.env` file with:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/registro_torneo"

ADMIN_PASSWORD="change-me"
ADMIN_SESSION_SECRET="change-me-too"
ADMIN_EMAIL="admin@example.com"

SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
FROM_EMAIL=""
```

If SMTP variables are missing, registrations are still stored and users see an on-screen email warning.

## Local setup
1. Install dependencies.
   ```bash
   pnpm install
   ```
2. Start Postgres.
   ```bash
   docker compose up -d
   ```
3. Run migrations.
   ```bash
   pnpm prisma migrate dev
   ```
4. (Optional) Seed sample tournament/divisions.
   ```bash
   pnpm prisma db seed
   ```
5. Start app.
   ```bash
   pnpm dev
   ```

## Core routes
- Public:
  - `/tournaments/[slug]`
  - `/tournaments/[slug]/register`
  - `/tournaments/[slug]/register/success`
- Admin:
  - `/admin`
  - `/admin/login`
  - `/admin/tournaments`
  - `/admin/tournaments/new`
  - `/admin/tournaments/[id]/edit`
  - `/admin/tournaments/[id]/divisions`
  - `/admin/divisions/new?tournamentId=...`
  - `/admin/divisions/[id]/edit`
  - `/admin/registrations?tournamentId=...`
