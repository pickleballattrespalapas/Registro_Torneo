import { Prisma, EntryStatus, EventType, PricingTier } from "@prisma/client";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";

export async function getTournament() {
  return prisma.tournament.findFirst({
    include: {
      events: true,
      waivers: { where: { isActive: true }, take: 1 },
    },
  });
}

export function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

export function resolvePricingTier(tournament: {
  earlyPricingStart: Date;
  earlyPricingEnd: Date;
  regularPricingStart: Date;
  regularPricingEnd: Date;
  latePricingStart: Date;
  latePricingEnd: Date;
}): PricingTier {
  const now = new Date();
  if (now >= tournament.earlyPricingStart && now <= tournament.earlyPricingEnd) {
    return PricingTier.EARLY;
  }
  if (
    now >= tournament.regularPricingStart &&
    now <= tournament.regularPricingEnd
  ) {
    return PricingTier.REGULAR;
  }
  return PricingTier.LATE;
}

export function resolvePriceUsd(
  tournament: {
    earlyPriceUsd: Prisma.Decimal;
    regularPriceUsd: Prisma.Decimal;
    latePriceUsd: Prisma.Decimal;
  },
  tier: PricingTier,
) {
  if (tier === PricingTier.EARLY) {
    return tournament.earlyPriceUsd;
  }
  if (tier === PricingTier.REGULAR) {
    return tournament.regularPriceUsd;
  }
  return tournament.latePriceUsd;
}

export function resolveAmountMxn(
  amountUsd: Prisma.Decimal,
  tournament: { usdToMxnRate: Prisma.Decimal; mxnRoundingIncrement: number },
) {
  const raw = Number(amountUsd) * Number(tournament.usdToMxnRate);
  const increment = tournament.mxnRoundingIncrement || 1;
  return Math.round(raw / increment) * increment;
}

export function isDoublesEvent(eventType: EventType) {
  return (
    eventType === EventType.DOBLES_VARONIL ||
    eventType === EventType.DOBLES_FEMENIL ||
    eventType === EventType.DOBLES_MIXTO
  );
}

export async function createEntriesForRegistration({
  registrationId,
  playerId,
  eventIds,
}: {
  registrationId: string;
  playerId: string;
  eventIds: string[];
}) {
  const tournament = await prisma.tournament.findFirst();
  if (!tournament) {
    throw new Error("Tournament not found");
  }

  const tier = resolvePricingTier(tournament);
  const amountUsd = resolvePriceUsd(tournament, tier);
  const amountMxn = resolveAmountMxn(amountUsd, tournament);

  const events = await prisma.event.findMany({
    where: { id: { in: eventIds } },
  });

  await prisma.$transaction(async (tx) => {
    const existingEntries = await tx.eventEntry.findMany({
      where: { registrationId },
      select: { id: true },
    });

    const entryIds = existingEntries.map((entry) => entry.id);

    if (entryIds.length > 0) {
      await tx.teamMember.deleteMany({
        where: { entryId: { in: entryIds } },
      });
      await tx.partnerInvite.deleteMany({
        where: { entryId: { in: entryIds } },
      });
      await tx.eventEntry.deleteMany({
        where: { id: { in: entryIds } },
      });
    }

    for (const event of events) {
      const isDoubles = isDoublesEvent(event.eventType);
      const entry = await tx.eventEntry.create({
        data: {
          registrationId,
          eventId: event.id,
          status: isDoubles ? EntryStatus.NEED_PARTNER : EntryStatus.COMPLETE,
          pricingTier: tier,
          amountUsd,
          amountMxn,
        },
      });

      if (isDoubles) {
        await tx.teamMember.create({
          data: {
            entryId: entry.id,
            playerId,
          },
        });
      }
    }
  });
}
