import Link from "next/link";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export default async function AdminHome() {
  requireAdmin();
  const tournaments = await prisma.tournament.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin</h1>
      <ul>
        <li><Link href="/admin/tournaments">Manage tournaments</Link></li>
      </ul>
      <h2>Quick access</h2>
      <ul>
        {tournaments.map((t) => (
          <li key={t.id}>
            <Link href={`/admin/registrations?tournamentId=${t.id}`}>{t.name} registrations</Link>
          </li>
        ))}
      </ul>
      <form method="POST" action="/api/admin/logout">
        <button type="submit">Logout</button>
      </form>
    </main>
  );
}
