import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export default async function TournamentPage({ params }: { params: { slug: string } }) {
  const tournament = await prisma.tournament.findUnique({ where: { slug: params.slug } });

  if (!tournament) notFound();

  return (
    <main style={{ padding: 24 }}>
      <h1>{tournament.name}</h1>
      <p>{new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}</p>
      <p>{tournament.location}</p>
      <p>{tournament.descriptionShort}</p>
      <p>Registration deadline: {new Date(tournament.registrationDeadline).toLocaleDateString()}</p>
      <Link href={`/tournaments/${tournament.slug}/register`}>Register Now</Link>
    </main>
  );
}
