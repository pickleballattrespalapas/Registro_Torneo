import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { createEntriesForRegistration } from "@/lib/registration";

export default async function RegistrationEventsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { manageToken?: string; level?: string };
}) {
  const t = await getTranslations("registrationEvents");
  const manageToken = searchParams.manageToken;
  const level = searchParams.level;

  if (!manageToken) {
    return (
      <main>
        <h1>{t("missingTitle")}</h1>
        <p>{t("missingCopy")}</p>
      </main>
    );
  }

  const registration = await prisma.registration.findUnique({
    where: { manageToken },
    include: { player: true },
  });

  const tournament = await prisma.tournament.findFirst({
    include: { events: true },
  });

  if (!registration || !tournament) {
    return (
      <main>
        <h1>{t("missingTitle")}</h1>
        <p>{t("missingCopy")}</p>
      </main>
    );
  }

  async function handleSubmit(formData: FormData) {
    "use server";

    const token = String(formData.get("manageToken") || "").trim();
    const selectedLevel = String(formData.get("level") || "").trim();
    const selectedEvents = formData.getAll("events").map(String);

    if (!token || selectedEvents.length === 0) {
      return;
    }

    const registrationRecord = await prisma.registration.findUnique({
      where: { manageToken: token },
    });

    if (!registrationRecord) {
      return;
    }

    const player = await prisma.player.findUnique({
      where: { id: registrationRecord.playerId },
    });

    if (!player) {
      return;
    }

    await createEntriesForRegistration({
      registrationId: registrationRecord.id,
      playerId: player.id,
      eventIds: selectedEvents,
    });

    const query = new URLSearchParams({
      manageToken: token,
      level: selectedLevel,
    });
    redirect(`/${params.locale}/inscripcion/resumen?${query.toString()}`);
  }

  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{t("subtitle", { name: registration.player.firstName })}</p>
      <form action={handleSubmit}>
        <input type="hidden" name="manageToken" value={manageToken} />
        <input type="hidden" name="level" value={level ?? ""} />
        {tournament.events.map((event) => (
          <label key={event.id}>
            <input type="checkbox" name="events" value={event.id} />
            {event.name}
          </label>
        ))}
        <button type="submit">{t("continue")}</button>
      </form>
    </main>
  );
}
