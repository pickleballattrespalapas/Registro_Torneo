import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { getEventTypeLabel, getLocalizedEventName } from "@/lib/public";

export default async function EventosPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("events");
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
              <strong>{getLocalizedEventName(locale, event)}</strong>
              <div>{getEventTypeLabel(locale, event.eventType)}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
