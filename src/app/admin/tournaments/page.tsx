import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

async function deleteTournament(formData: FormData) {
  "use server";
  requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) {
    await prisma.tournament.delete({ where: { id } });
  }
  redirect("/admin/tournaments");
}

export default async function AdminTournamentsPage() {
  requireAdmin();
  const tournaments = await prisma.tournament.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main style={{ padding: 24 }}>
      <h1>Tournaments</h1>
      <p><Link href="/admin/tournaments/new">New tournament</Link></p>
      <ul>
        {tournaments.map((t) => (
          <li key={t.id}>
            {t.name} - <Link href={`/admin/tournaments/${t.id}/edit`}>Edit</Link> - {" "}
            <Link href={`/admin/tournaments/${t.id}/divisions`}>Divisions</Link> - {" "}
            <Link href={`/admin/registrations?tournamentId=${t.id}`}>Registrations</Link>
            <form action={deleteTournament} style={{ display: "inline", marginLeft: 8 }}>
              <input type="hidden" name="id" value={t.id} />
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
