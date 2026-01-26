# Registro Torneo

Bootstrap for the tournament registration web app.

## Local setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start Postgres:
   ```bash
   docker compose up -d
   ```
3. Run migrations:
   ```bash
   pnpm prisma migrate dev
   ```
4. Seed the database:
   ```bash
   pnpm prisma db seed
   ```
5. Start the dev server:
   ```bash
   pnpm dev
   ```
