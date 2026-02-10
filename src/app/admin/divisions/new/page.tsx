import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

async function createDivision(formData: FormData) {
  "use server";
  requireAdmin();

  const tournamentId = String(formData.get("tournamentId") || "");
  await prisma.division.create({
    data: {
      tournamentId,
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

export default function NewDivisionPage({ searchParams }: { searchParams: { tournamentId?: string } }) {
  requireAdmin();

  return (
    <main style={{ padding: 24 }}>
      <h1>New Division</h1>
      <form action={createDivision} style={{ display: "grid", gap: 8, maxWidth: 500 }}>
        <input name="tournamentId" defaultValue={searchParams.tournamentId || ""} required />
        <input name="name" placeholder="name" required />
        <label>event_type
          <select name="eventType" required>
            <option value="mens">mens</option>
            <option value="womens">womens</option>
            <option value="mixed">mixed</option>
          </select>
        </label>
        <label>format
          <select name="format" required>
            <option value="singles">singles</option>
            <option value="doubles">doubles</option>
          </select>
        </label>
        <input name="skillLevel" placeholder="skill_level" required />
        <input type="number" name="price" step="0.01" placeholder="price" required />
        <input type="number" name="capacity" placeholder="capacity" required />
        <label><input type="checkbox" name="isOpen" defaultChecked /> is_open</label>
        <button type="submit">Create</button>
      </form>
    </main>
  );
}
