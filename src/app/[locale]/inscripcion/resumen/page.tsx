import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { isDoublesEvent } from "@/lib/registration";

export default async function RegistrationSummaryPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { manageToken?: string; level?: string };
}) {
  const t = await getTranslations("registrationSummary");
  const manageToken = searchParams.manageToken;
  const level = searchParams.level ?? "";

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
    include: {
      player: true,
      entries: { include: { event: true } },
    },
  });

  if (!registration) {
    return (
      <main>
        <h1>{t("missingTitle")}</h1>
        <p>{t("missingCopy")}</p>
      </main>
    );
  }

  const query = new URLSearchParams({ manageToken, level });

  return (
    <main>
      <h1>{t("title")}</h1>
      <section>
        <h2>{t("playerTitle")}</h2>
        <p>
          {registration.player.firstName} {registration.player.lastName}
        </p>
        <p>{registration.player.email}</p>
        <p>
          {t("levelLabel")}: {level}
        </p>
      </section>
      <section>
        <h2>{t("eventsTitle")}</h2>
        <ul>
          {registration.entries.map((entry) => {
            const isDoubles = isDoublesEvent(entry.event.eventType);
            const statusLabel = isDoubles
              ? entry.status === "COMPLETE"
                ? t("statusComplete")
                : entry.status === "PENDING"
                  ? t("statusPending")
                  : t("statusNeedsPartner")
              : t("statusComplete");

            return (
              <li key={entry.id}>
                <strong>{entry.event.name}</strong> — {statusLabel}
              </li>
            );
          })}
        </ul>
      </section>
      <Link href={`/${params.locale}/inscripcion/exencion?${query.toString()}`}>
        {t("continue")}
      </Link>
    </main>
  );
}
