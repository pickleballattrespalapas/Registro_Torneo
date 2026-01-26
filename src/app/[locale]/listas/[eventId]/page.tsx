import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import {
  getEventTypeLabel,
  getLocalizedEventName,
  getStatusLabel,
  sortEntries,
} from "@/lib/public";

const FALLBACK_VISIBLE_STATUSES = ["COMPLETE", "PENDING", "NEED_PARTNER"] as const;

export default async function EventRosterPage({
  params: { locale, eventId },
}: {
  params: { locale: string; eventId: string };
}) {
  const t = await getTranslations("roster");
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      policyOverride: true,
      tournament: {
        include: {
          policy: true,
        },
      },
      entries: {
        include: {
          registration: {
            include: {
              player: true,
            },
          },
          teamMembers: {
            include: {
              player: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const tournamentPolicy = event.tournament.policy;
  const visibleStatuses =
    event.policyOverride?.rosterVisibleStatuses ??
    tournamentPolicy?.rosterVisibleStatuses ??
    FALLBACK_VISIBLE_STATUSES;
  const orderingMode =
    event.policyOverride?.rosterOrderingMode ??
    tournamentPolicy?.rosterOrderingMode ??
    "STATUS_THEN_NAME";

  const filteredEntries = event.entries.filter((entry) =>
    visibleStatuses.includes(entry.status),
  );

  const entryRows = filteredEntries.map((entry) => {
    const inviter = entry.registration.player;
    const inviterName = `${inviter.firstName} ${inviter.lastName}`.trim();
    const partner =
      entry.teamMembers.find((member) => member.playerId !== inviter.id)?.player ??
      null;
    const partnerName = partner
      ? `${partner.firstName} ${partner.lastName}`.trim()
      : "";

    return {
      id: entry.id,
      status: entry.status,
      inviterName,
      partnerName,
      sortName: `${inviter.lastName} ${inviter.firstName}`.trim(),
    };
  });

  const sortedEntries = sortEntries(entryRows, orderingMode, visibleStatuses);
  const isDoubles = event.eventType !== "INDIVIDUAL";

  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{getLocalizedEventName(locale, event)}</p>
      <p>{getEventTypeLabel(locale, event.eventType)}</p>
      {sortedEntries.length === 0 ? (
        <p>{t("empty")}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{t("statusLabel")}</th>
              <th>{t("inviterLabel")}</th>
              {isDoubles ? <th>{t("partnerLabel")}</th> : null}
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry) => (
              <tr key={entry.id}>
                <td>{getStatusLabel(locale, entry.status)}</td>
                <td>{entry.inviterName}</td>
                {isDoubles ? (
                  <td>{entry.partnerName || t("partnerPlaceholder")}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
