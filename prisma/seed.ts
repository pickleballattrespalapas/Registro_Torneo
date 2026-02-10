import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tournament = await prisma.tournament.create({
    data: {
      name: "Tres Palapas Open",
      slug: "tres-palapas-open",
      startDate: new Date("2026-03-20"),
      endDate: new Date("2026-03-22"),
      descriptionShort: "Weekend tournament at Tres Palapas.",
      registrationDeadline: new Date("2026-03-10T23:59:59Z"),
    },
  });

  await prisma.division.createMany({
    data: [
      {
        tournamentId: tournament.id,
        name: "Mixed Doubles 3.5",
        eventType: "mixed",
        format: "doubles",
        skillLevel: "3.5",
        price: 60,
        capacity: 16,
        isOpen: true,
      },
      {
        tournamentId: tournament.id,
        name: "Women Singles 3.0",
        eventType: "womens",
        format: "singles",
        skillLevel: "3.0",
        price: 45,
        capacity: 24,
        isOpen: true,
      },
    ],
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
