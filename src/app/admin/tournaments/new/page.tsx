import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

async function createTournament(formData: FormData) {
  "use server";
  requireAdmin();

  await prisma.tournament.create({
    data: {
      name: String(formData.get("name") || ""),
      slug: String(formData.get("slug") || ""),
      startDate: new Date(String(formData.get("startDate") || "")),
      endDate: new Date(String(formData.get("endDate") || "")),
      location: String(formData.get("location") || "Tres Palapas Baja Pickleball Resort, Los Barriles, Mexico"),
      descriptionShort: String(formData.get("descriptionShort") || ""),
      registrationDeadline: new Date(String(formData.get("registrationDeadline") || "")),
    },
  });

  redirect("/admin/tournaments");
}

export default function NewTournamentPage() {
  requireAdmin();

  return (
    <main style={{ padding: 24 }}>
      <h1>New Tournament</h1>
      <form action={createTournament} style={{ display: "grid", gap: 8, maxWidth: 500 }}>
        <input name="name" placeholder="name" required />
        <input name="slug" placeholder="slug" required />
        <label>start_date <input type="date" name="startDate" required /></label>
        <label>end_date <input type="date" name="endDate" required /></label>
        <input name="location" defaultValue="Tres Palapas Baja Pickleball Resort, Los Barriles, Mexico" required />
        <textarea name="descriptionShort" placeholder="description_short" required />
        <label>registration_deadline <input type="datetime-local" name="registrationDeadline" required /></label>
        <button type="submit">Create</button>
      </form>
    </main>
  );
}
