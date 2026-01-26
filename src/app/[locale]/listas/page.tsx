import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { getLocalizedEventName } from "@/lib/public";

export default async function ListasPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("lists");
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <main>
      <h1>{t("title")}</h1>
      {events.length === 0 ? (
        <p>{t("empty")}</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <Link href={`/${locale}/listas/${event.id}`}>
                {getLocalizedEventName(locale, event)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
