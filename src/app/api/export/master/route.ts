import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { toCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  if (!isAdminAuthenticated()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const tournamentId = url.searchParams.get("tournamentId");
  if (!tournamentId) {
    return new NextResponse("Missing tournamentId", { status: 400 });
  }

  const rows = await prisma.registration.findMany({
    where: { tournamentId },
    include: {
      division: { select: { id: true, name: true } },
      player: { select: { name: true, email: true, phone: true, skillLevel: true } },
      team: {
        include: {
          player1: { select: { name: true, email: true, phone: true, skillLevel: true } },
          player2: { select: { name: true, email: true, phone: true, skillLevel: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const csv = toCsv(rows, true);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tournament-${tournamentId}-master.csv"`,
    },
  });
}
