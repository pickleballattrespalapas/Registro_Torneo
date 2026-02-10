import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const tournament = await prisma.tournament.findFirst({ orderBy: { startDate: "asc" } });

  return (
    <main style={{ padding: 24 }}>
      <h1>Registro Torneo</h1>
      {tournament ? (
        <p>
          Current tournament: <Link href={`/tournaments/${tournament.slug}`}>{tournament.name}</Link>
        </p>
      ) : (
        <p>No tournament created yet.</p>
      )}
      <p>
        <Link href="/admin">Admin</Link>
      </p>
    </main>
  );
}
