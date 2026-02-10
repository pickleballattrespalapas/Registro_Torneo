import { notFound, redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

async function updateDivision(formData: FormData) {
  "use server";
  requireAdmin();

  const id = String(formData.get("id") || "");
  const tournamentId = String(formData.get("tournamentId") || "");

  await prisma.division.update({
    where: { id },
    data: {
      name: String(formData.get("name") || ""),
      eventType: String(formData.get("eventType") || "mixed") as "mens" | "womens" | "mixed",
      format: String(formData.get("format") || "singles") as "singles" | "doubles",
      skillLevel: String(formData.get("skillLevel") || ""),
      price: Number(formData.get("price") || 0),
      capacity: Number(formData.get("capacity") || 0),
      isOpen: formData.get("isOpen") === "on",
    },
  });

  redirect(`/admin/tournaments/${tournamentId}/divisions`);
}

export default async function EditDivisionPage({ params }: { params: { id: string } }) {
  requireAdmin();
  const division = await prisma.division.findUnique({ where: { id: params.id } });
  if (!division) notFound();

  return (
    <main style={{ padding: 24 }}>
      <h1>Edit Division</h1>
      <form action={updateDivision} style={{ display: "grid", gap: 8, maxWidth: 500 }}>
        <input type="hidden" name="id" value={division.id} />
        <input type="hidden" name="tournamentId" value={division.tournamentId} />
        <input name="name" defaultValue={division.name} required />
        <label>event_type
          <select name="eventType" defaultValue={division.eventType} required>
            <option value="mens">mens</option>
            <option value="womens">womens</option>
            <option value="mixed">mixed</option>
          </select>
        </label>
        <label>format
          <select name="format" defaultValue={division.format} required>
            <option value="singles">singles</option>
            <option value="doubles">doubles</option>
          </select>
        </label>
        <input name="skillLevel" defaultValue={division.skillLevel} required />
        <input type="number" name="price" step="0.01" defaultValue={Number(division.price)} required />
        <input type="number" name="capacity" defaultValue={division.capacity} required />
        <label><input type="checkbox" name="isOpen" defaultChecked={division.isOpen} /> is_open</label>
        <button type="submit">Save</button>
      </form>
    </main>
  );
}
