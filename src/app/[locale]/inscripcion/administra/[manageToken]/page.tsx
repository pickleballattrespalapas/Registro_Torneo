import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import CopyButton from "@/components/CopyButton";
import { prisma } from "@/lib/prisma";
import { generateToken, isDoublesEvent } from "@/lib/registration";

export default async function ManageRegistrationPage({
  params,
}: {
  params: { locale: string; manageToken: string };
}) {
  const t = await getTranslations("manageRegistration");

  const registration = await prisma.registration.findUnique({
    where: { manageToken: params.manageToken },
    include: {
      player: true,
      entries: {
        include: {
          event: true,
          partnerInvite: true,
          teamMembers: { include: { player: true } },
        },
      },
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

  const teamMemberships = await prisma.teamMember.findMany({
    where: { playerId: registration.playerId },
    include: {
      entry: {
        include: {
          event: true,
          registration: { include: { player: true } },
          partnerInvite: true,
          teamMembers: { include: { player: true } },
        },
      },
    },
  });

  const entriesMap = new Map<
    string,
    { entry: (typeof registration.entries)[number]; role: "owner" | "partner" }
  >();

  registration.entries.forEach((entry) => {
    entriesMap.set(entry.id, { entry, role: "owner" });
  });

  teamMemberships.forEach((membership) => {
    if (!entriesMap.has(membership.entryId)) {
      entriesMap.set(membership.entryId, {
        entry: membership.entry,
        role: "partner",
      });
    }
  });

  async function handleGenerateInvite(formData: FormData) {
    "use server";

    const entryId = String(formData.get("entryId") || "").trim();
    const manageToken = String(formData.get("manageToken") || "").trim();

    if (!entryId || !manageToken) {
      return;
    }

    const entry = await prisma.eventEntry.findUnique({
      where: { id: entryId },
      include: { event: true, registration: true, partnerInvite: true },
    });

    if (!entry || entry.registration.manageToken !== manageToken) {
      return;
    }

    if (!isDoublesEvent(entry.event.eventType)) {
      return;
    }

    await prisma.eventEntry.update({
      where: { id: entry.id },
      data: { status: "PENDING" },
    });

    if (!entry.partnerInvite) {
      await prisma.partnerInvite.create({
        data: {
          entryId: entry.id,
          token: generateToken(),
        },
      });
    }

    redirect(`/${params.locale}/inscripcion/administra/${manageToken}`);
  }

  const entries = Array.from(entriesMap.values());

  return (
    <main>
      <h1>{t("title")}</h1>
      <p>
        {registration.player.firstName} {registration.player.lastName}
      </p>
      <section>
        <h2>{t("entriesTitle")}</h2>
        {entries.length === 0 ? (
          <p>{t("empty")}</p>
        ) : (
          <ul>
            {entries.map(({ entry, role }) => {
              const isDoubles = isDoublesEvent(entry.event.eventType);
              const inviteUrl = entry.partnerInvite
                ? `/${params.locale}/invitar/${entry.partnerInvite.token}`
                : "";
              const statusLabel = isDoubles
                ? entry.status === "COMPLETE"
                  ? t("statusComplete")
                  : entry.status === "PENDING"
                    ? t("statusPending")
                    : t("statusNeedsPartner")
                : t("statusComplete");

              return (
                <li key={entry.id}>
                  <p>
                    <strong>{entry.event.name}</strong> — {statusLabel}
                  </p>
                  <p>{role === "owner" ? t("roleOwner") : t("rolePartner")}</p>
                  {isDoubles && role === "owner" ? (
                    <div>
                      {entry.status === "NEED_PARTNER" && (
                        <form action={handleGenerateInvite}>
                          <input type="hidden" name="entryId" value={entry.id} />
                          <input
                            type="hidden"
                            name="manageToken"
                            value={params.manageToken}
                          />
                          <button type="submit">{t("generateLink")}</button>
                        </form>
                      )}
                      {entry.partnerInvite && (
                        <div>
                          <p>{t("invitePending")}</p>
                          <CopyButton
                            text={inviteUrl}
                            label={t("copyLink")}
                            copiedLabel={t("copied")}
                          />
                          <p>
                            <Link href={inviteUrl}>{inviteUrl}</Link>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
