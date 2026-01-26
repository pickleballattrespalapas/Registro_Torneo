import type { EntryStatus, EventType, RosterOrderingMode } from "@prisma/client";

const eventTypeLabels: Record<
  string,
  Record<EventType, string>
> = {
  en: {
    INDIVIDUAL: "Singles",
    DOBLES_VARONIL: "Men's Doubles",
    DOBLES_FEMENIL: "Women's Doubles",
    DOBLES_MIXTO: "Mixed Doubles",
  },
  "es-MX": {
    INDIVIDUAL: "Individual",
    DOBLES_VARONIL: "Dobles Varonil",
    DOBLES_FEMENIL: "Dobles Femenil",
    DOBLES_MIXTO: "Dobles Mixto",
  },
};

const statusLabels: Record<string, Record<EntryStatus, string>> = {
  en: {
    COMPLETE: "Complete",
    PENDING: "Pending",
    NEED_PARTNER: "Needs partner",
    WAITLIST: "Waitlist",
    CANCELED: "Canceled",
  },
  "es-MX": {
    COMPLETE: "Completo",
    PENDING: "Pendiente",
    NEED_PARTNER: "Falta compañero(a)",
    WAITLIST: "Lista de espera",
    CANCELED: "Cancelado",
  },
};

export function getEventTypeLabel(locale: string, eventType: EventType) {
  return eventTypeLabels[locale]?.[eventType] ?? eventTypeLabels.en[eventType];
}

export function getStatusLabel(locale: string, status: EntryStatus) {
  return statusLabels[locale]?.[status] ?? statusLabels.en[status];
}

export function getLocalizedEventName(
  locale: string,
  event: { name: string; eventType: EventType },
) {
  const targetLabel = getEventTypeLabel(locale, event.eventType);
  const fallbackLocale = locale === "en" ? "es-MX" : "en";
  const fallbackLabel = getEventTypeLabel(fallbackLocale, event.eventType);

  if (event.name.startsWith(targetLabel)) {
    return event.name;
  }
  if (event.name.startsWith(fallbackLabel)) {
    return `${targetLabel}${event.name.slice(fallbackLabel.length)}`;
  }
  return event.name;
}

export function sortEntries<T extends { status: EntryStatus; sortName: string }>(
  entries: T[],
  orderingMode: RosterOrderingMode,
  statusOrder: EntryStatus[],
) {
  const statusIndex = new Map(statusOrder.map((status, index) => [status, index]));
  const getStatusRank = (status: EntryStatus) =>
    statusIndex.get(status) ?? statusOrder.length;

  return [...entries].sort((a, b) => {
    const nameCompare = a.sortName.localeCompare(b.sortName, "es", {
      sensitivity: "base",
    });

    if (orderingMode === "NAME_THEN_STATUS") {
      if (nameCompare !== 0) {
        return nameCompare;
      }
      return getStatusRank(a.status) - getStatusRank(b.status);
    }

    const statusCompare = getStatusRank(a.status) - getStatusRank(b.status);
    if (statusCompare !== 0) {
      return statusCompare;
    }
    return nameCompare;
  });
}
