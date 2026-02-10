import Link from "next/link";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: { tournamentId?: string; divisionId?: string };
}) {
  requireAdmin();

  const tournamentId = searchParams.tournamentId;
  if (!tournamentId) {
    return <main style={{ padding: 24 }}>Missing tournamentId.</main>;
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      divisions: { orderBy: { name: "asc" } },
      registrations: {
        where: searchParams.divisionId ? { divisionId: searchParams.divisionId } : undefined,
        include: {
          division: true,
          player: true,
          team: { include: { player1: true, player2: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!tournament) {
    return <main style={{ padding: 24 }}>Tournament not found.</main>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Registrations: {tournament.name}</h1>
      <p>
        <Link href={`/api/export/master?tournamentId=${tournament.id}`}>Export master CSV</Link>
      </p>
      <form>
        <input type="hidden" name="tournamentId" value={tournament.id} />
        <label>
          Division filter
          <select name="divisionId" defaultValue={searchParams.divisionId || ""}>
            <option value="">All</option>
            {tournament.divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
        <button type="submit">Apply</button>
      </form>
      <ul>
        {tournament.divisions.map((d) => (
          <li key={d.id}><Link href={`/api/export/division/${d.id}`}>Export CSV: {d.name}</Link></li>
        ))}
      </ul>
      <table>
        <thead>
          <tr>
            <th>Division</th>
            <th>Player 1</th>
            <th>Player 2</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {tournament.registrations.map((r) => (
            <tr key={r.id}>
              <td>{r.division.name}</td>
              <td>{r.player ? `${r.player.name} (${r.player.email})` : `${r.team?.player1.name} (${r.team?.player1.email})`}</td>
              <td>{r.team ? `${r.team.player2.name} (${r.team.player2.email})` : ""}</td>
              <td>{r.status}</td>
              <td>{r.paymentStatus}</td>
              <td>{r.createdAt.toISOString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
