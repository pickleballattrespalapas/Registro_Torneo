import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.tournament.create({
    data: {
      name: "Torneo de Primavera",
      timezone: "America/Mexico_City",
      usdToMxnRate: new Prisma.Decimal("17.50"),
      mxnRoundingIncrement: 5,
      earlyPricingStart: new Date("2025-02-01T00:00:00-06:00"),
      earlyPricingEnd: new Date("2025-02-15T23:59:59-06:00"),
      regularPricingStart: new Date("2025-02-16T00:00:00-06:00"),
      regularPricingEnd: new Date("2025-03-01T23:59:59-06:00"),
      latePricingStart: new Date("2025-03-02T00:00:00-06:00"),
      latePricingEnd: new Date("2025-03-15T23:59:59-06:00"),
      earlyPriceUsd: new Prisma.Decimal("35.00"),
      regularPriceUsd: new Prisma.Decimal("45.00"),
      latePriceUsd: new Prisma.Decimal("55.00"),
      policy: {
        create: {
          rosterVisibleStatuses: ["COMPLETE", "PENDING", "NEED_PARTNER"],
          rosterOrderingMode: "STATUS_THEN_NAME",
          capacityCountingMode: "COUNT_COMPLETE_ONLY",
          onFullAction: "ADD_TO_WAITLIST",
          afterPartnerDeadlineAction: "MOVE_TO_WAITLIST",
        },
      },
      events: {
        create: [
          {
            name: "Dobles Varonil 3.5 19+",
            eventType: "DOBLES_VARONIL",
          },
          {
            name: "Individual 3.5 19+",
            eventType: "INDIVIDUAL",
          },
        ],
      },
      waivers: {
        create: {
          titleEn: "Release and waiver of liability",
          bodyEn:
            "I acknowledge the inherent risks of participation and hereby release, waive, and discharge the organizers from any and all liability, claims, and demands arising from my participation in the tournament. I understand that I am responsible for my own health and safety and agree to follow event rules and instructions.\n\nPhoto release\nI grant permission for my image and likeness to be captured during the event and used for event-related communications and promotional materials without compensation.",
          titleEs: "Exención y liberación de responsabilidad",
          bodyEsMx:
            "Reconozco los riesgos inherentes de mi participación y por la presente libero, eximo y descargo a los organizadores de toda responsabilidad, reclamación o demanda derivada de mi participación en el torneo. Entiendo que soy responsable de mi propia salud y seguridad y me comprometo a cumplir con las reglas e indicaciones del evento.\n\nAutorización de uso de imagen\nOtorgo autorización para que mi imagen y apariencia sean captadas durante el evento y utilizadas en comunicaciones y materiales promocionales relacionados con el evento sin compensación.",
        },
      },
    },
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
