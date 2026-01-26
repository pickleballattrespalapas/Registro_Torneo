import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("home");
  const tournament = await prisma.tournament.findFirst();
  const dateFormatter = tournament
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeZone: tournament.timezone,
      })
    : null;
  const dateRange = tournament
    ? `${dateFormatter?.format(tournament.earlyPricingStart)} – ${dateFormatter?.format(
        tournament.latePricingEnd,
      )}`
    : t("tournamentDatesPlaceholder");

  return (
    <main>
      <h1>{t("headline")}</h1>
      <p>{t("subtitle")}</p>
      <section>
        <h2>{t("tournamentTitle")}</h2>
        <p>{tournament?.name ?? t("tournamentNamePlaceholder")}</p>
        <p>{dateRange}</p>
      </section>
      <Link href={`/${locale}/inscripcion/iniciar`}>{t("cta")}</Link>
      <section>
        <h2>{t("sponsorsTitle")}</h2>
        <p>{t("sponsorsPlaceholder")}</p>
      </section>
    </main>
  );
}
