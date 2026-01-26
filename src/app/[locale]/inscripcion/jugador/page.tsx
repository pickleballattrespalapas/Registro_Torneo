import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { generateToken, getTournament } from "@/lib/registration";

export default async function RegistrationPlayerPage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("registrationPlayer");
  const tournament = await getTournament();

  async function handleSubmit(formData: FormData) {
    "use server";

    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();

    if (!firstName || !lastName || !email) {
      return;
    }

    const tournamentRecord = await prisma.tournament.findFirst({
      select: { id: true },
    });

    if (!tournamentRecord) {
      return;
    }

    const player = await prisma.player.upsert({
      where: { email },
      update: { firstName, lastName },
      create: { firstName, lastName, email },
    });

    const manageToken = generateToken();

    await prisma.registration.create({
      data: {
        tournamentId: tournamentRecord.id,
        playerId: player.id,
        manageToken,
      },
    });

    redirect(`/${params.locale}/inscripcion/nivel?manageToken=${manageToken}`);
  }

  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{t("subtitle", { tournament: tournament?.name ?? "" })}</p>
      <form action={handleSubmit}>
        <label htmlFor="firstName">{t("firstName")}</label>
        <input id="firstName" name="firstName" type="text" required />

        <label htmlFor="lastName">{t("lastName")}</label>
        <input id="lastName" name="lastName" type="text" required />

        <label htmlFor="email">{t("email")}</label>
        <input id="email" name="email" type="email" required />

        <button type="submit">{t("continue")}</button>
      </form>
    </main>
  );
}
