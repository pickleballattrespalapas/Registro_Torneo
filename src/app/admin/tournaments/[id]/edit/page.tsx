import { notFound, redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

async function updateTournament(formData: FormData) {
  "use server";
  requireAdmin();
  const id = String(formData.get("id") || "");

  await prisma.tournament.update({
    where: { id },
    data: {
      name: String(formData.get("name") || ""),
      slug: String(formData.get("slug") || ""),
      startDate: new Date(String(formData.get("startDate") || "")),
      endDate: new Date(String(formData.get("endDate") || "")),
      location: String(formData.get("location") || ""),
      descriptionShort: String(formData.get("descriptionShort") || ""),
      registrationDeadline: new Date(String(formData.get("registrationDeadline") || "")),
    },
  });

  redirect("/admin/tournaments");
}

export default async function EditTournamentPage({ params }: { params: { id: string } }) {
  requireAdmin();
  const tournament = await prisma.tournament.findUnique({ where: { id: params.id } });
  if (!tournament) notFound();

  return (
    <main style={{ padding: 24 }}>
      <h1>Edit Tournament</h1>
      <form action={updateTournament} style={{ display: "grid", gap: 8, maxWidth: 500 }}>
        <input type="hidden" name="id" value={tournament.id} />
        <input name="name" defaultValue={tournament.name} required />
        <input name="slug" defaultValue={tournament.slug} required />
        <label>start_date <input type="date" name="startDate" defaultValue={tournament.startDate.toISOString().slice(0, 10)} required /></label>
        <label>end_date <input type="date" name="endDate" defaultValue={tournament.endDate.toISOString().slice(0, 10)} required /></label>
        <input name="location" defaultValue={tournament.location} required />
        <textarea name="descriptionShort" defaultValue={tournament.descriptionShort} required />
        <label>registration_deadline <input type="datetime-local" name="registrationDeadline" defaultValue={tournament.registrationDeadline.toISOString().slice(0, 16)} required /></label>
        <button type="submit">Save</button>
      </form>
    </main>
  );
}
