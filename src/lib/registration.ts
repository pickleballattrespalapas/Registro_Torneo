import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getDivisionWithCounts(divisionId: string) {
  const division = await prisma.division.findUnique({
    where: { id: divisionId },
    include: {
      _count: { select: { registrations: true } },
    },
  });

  if (!division) return null;

  return {
    division,
    count: division._count.registrations,
    isFull: division._count.registrations >= division.capacity,
  };
}

export async function createSinglesRegistration(input: {
  tournamentId: string;
  divisionId: string;
  player: { name: string; email: string; phone?: string; skillLevel: string };
  notes?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const division = await tx.division.findUnique({
      where: { id: input.divisionId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!division || !division.isOpen || division._count.registrations >= division.capacity) {
      throw new Error("Division Full");
    }

    const player = await tx.player.create({
      data: input.player,
    });

    const registration = await tx.registration.create({
      data: {
        tournamentId: input.tournamentId,
        divisionId: input.divisionId,
        playerId: player.id,
        notes: input.notes,
        status: "confirmed",
        paymentStatus: "unpaid",
      },
      include: { division: true, tournament: true },
    });

    return { registration, players: [player] };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function createDoublesRegistration(input: {
  tournamentId: string;
  divisionId: string;
  teamName?: string;
  player1: { name: string; email: string; phone?: string; skillLevel: string };
  player2: { name: string; email: string; phone?: string; skillLevel: string };
  notes?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const division = await tx.division.findUnique({
      where: { id: input.divisionId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!division || !division.isOpen || division._count.registrations >= division.capacity) {
      throw new Error("Division Full");
    }

    const registration = await tx.registration.create({
      data: {
        tournamentId: input.tournamentId,
        divisionId: input.divisionId,
        notes: input.notes,
        status: "confirmed",
        paymentStatus: "unpaid",
      },
      include: { division: true, tournament: true },
    });

    const [player1, player2] = await Promise.all([
      tx.player.create({ data: input.player1 }),
      tx.player.create({ data: input.player2 }),
    ]);

    const team = await tx.team.create({
      data: {
        divisionId: input.divisionId,
        registrationId: registration.id,
        teamName: input.teamName,
        player1Id: player1.id,
        player2Id: player2.id,
      },
    });

    await tx.registration.update({
      where: { id: registration.id },
      data: { teamId: team.id },
    });

    return { registration, players: [player1, player2] };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
