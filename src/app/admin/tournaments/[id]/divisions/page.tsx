import Link from "next/link";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export default async function TournamentDivisionsPage({ params }: { params: { id: string } }) {
  requireAdmin();
  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: { divisions: { orderBy: { name: "asc" } } },
  });

  if (!tournament) {
    return <main style={{ padding: 24 }}>Tournament not found.</main>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Divisions: {tournament.name}</h1>
      <p><Link href={`/admin/divisions/new?tournamentId=${tournament.id}`}>New division</Link></p>
      <ul>
        {tournament.divisions.map((division) => (
          <li key={division.id}>
            {division.name} ({division.format}) - <Link href={`/admin/divisions/${division.id}/edit`}>Edit</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
