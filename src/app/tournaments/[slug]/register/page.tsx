import Link from "next/link";
import { redirect } from "next/navigation";

import { createDoublesRegistration, createSinglesRegistration, getDivisionWithCounts } from "@/lib/registration";
import { sendRegistrationEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

async function registerAction(formData: FormData) {
  "use server";

  const slug = String(formData.get("slug") || "");
  const divisionId = String(formData.get("divisionId") || "");
  const format = String(formData.get("format") || "");
  const notes = String(formData.get("notes") || "");

  const tournament = await prisma.tournament.findUnique({ where: { slug } });
  if (!tournament || !divisionId) {
    redirect(`/tournaments/${slug}/register?error=Missing+required+fields`);
  }

  try {
    let result;
    if (format === "singles") {
      const name = String(formData.get("player1Name") || "").trim();
      const email = String(formData.get("player1Email") || "").trim();
      if (!name || !email) {
        redirect(`/tournaments/${slug}/register?error=Name,+email,+and+division+are+required`);
      }

      result = await createSinglesRegistration({
        tournamentId: tournament.id,
        divisionId,
        notes: notes || undefined,
        player: {
          name,
          email,
          phone: String(formData.get("player1Phone") || "").trim() || undefined,
          skillLevel: String(formData.get("player1Skill") || "").trim() || "",
        },
      });
    } else {
      const player1Name = String(formData.get("player1Name") || "").trim();
      const player1Email = String(formData.get("player1Email") || "").trim();
      const player2Name = String(formData.get("player2Name") || "").trim();
      const player2Email = String(formData.get("player2Email") || "").trim();
      if (!player1Name || !player1Email || !player2Name || !player2Email) {
        redirect(`/tournaments/${slug}/register?error=Name,+email,+and+division+are+required`);
      }

      result = await createDoublesRegistration({
        tournamentId: tournament.id,
        divisionId,
        teamName: String(formData.get("teamName") || "").trim() || undefined,
        notes: notes || undefined,
        player1: {
          name: player1Name,
          email: player1Email,
          phone: String(formData.get("player1Phone") || "").trim() || undefined,
          skillLevel: String(formData.get("player1Skill") || "").trim() || "",
        },
        player2: {
          name: player2Name,
          email: player2Email,
          phone: String(formData.get("player2Phone") || "").trim() || undefined,
          skillLevel: String(formData.get("player2Skill") || "").trim() || "",
        },
      });
    }

    const emails = result.players.map((p) => p.email);
    const emailStatus = await sendRegistrationEmail({
      recipients: emails,
      subject: `Registration confirmed: ${result.registration.division.name}`,
      body: `Your registration is confirmed for ${result.registration.tournament.name} / ${result.registration.division.name}. Payment status: unpaid (Pay at desk / Invoice later).`,
    });

    const query = emailStatus.sent ? "" : "?email=not-configured";
    redirect(`/tournaments/${slug}/register/success${query}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    if (message === "Division Full") {
      redirect(`/tournaments/${slug}/register?error=Division+Full`);
    }
    redirect(`/tournaments/${slug}/register?error=Registration+failed`);
  }
}

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { error?: string };
}) {
  const tournament = await prisma.tournament.findUnique({
    where: { slug: params.slug },
    include: { divisions: { orderBy: { name: "asc" } } },
  });

  if (!tournament) {
    return <main style={{ padding: 24 }}>Tournament not found.</main>;
  }

  const divisionsWithCounts = await Promise.all(
    tournament.divisions.map(async (d) => {
      const counts = await getDivisionWithCounts(d.id);
      return {
        ...d,
        count: counts?.count ?? 0,
        isFull: counts?.isFull ?? false,
      };
    }),
  );

  return (
    <main style={{ padding: 24 }}>
      <h1>Register: {tournament.name}</h1>
      {searchParams.error ? <p style={{ color: "red" }}>{searchParams.error}</p> : null}
      <form action={registerAction} style={{ display: "grid", gap: 12, maxWidth: 600 }}>
        <input type="hidden" name="slug" value={params.slug} />

        <label>
          Division
          <select name="divisionId" required>
            <option value="">Select one</option>
            {divisionsWithCounts.map((division) => (
              <option key={division.id} value={division.id} disabled={!division.isOpen || division.isFull}>
                {division.name} ({division.format}) {!division.isOpen || division.isFull ? "- Division Full" : ""}
              </option>
            ))}
          </select>
        </label>

        <label>
          Format
          <select name="format" required>
            <option value="singles">Singles</option>
            <option value="doubles">Doubles</option>
          </select>
        </label>

        <h2>Player 1</h2>
        <input name="player1Name" placeholder="Name" required />
        <input name="player1Email" type="email" placeholder="Email" required />
        <input name="player1Phone" placeholder="Phone (optional)" />
        <input name="player1Skill" placeholder="Skill level" />

        <h2>Player 2 (required for doubles)</h2>
        <input name="player2Name" placeholder="Name" />
        <input name="player2Email" type="email" placeholder="Email" />
        <input name="player2Phone" placeholder="Phone (optional)" />
        <input name="player2Skill" placeholder="Skill level" />

        <input name="teamName" placeholder="Team name (optional)" />
        <textarea name="notes" placeholder="Notes (optional)" />

        <button type="submit">Submit registration</button>
      </form>
      <p>
        <Link href={`/tournaments/${params.slug}`}>Back</Link>
      </p>
    </main>
  );
}
