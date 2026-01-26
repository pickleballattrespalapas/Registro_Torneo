import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { generateToken, isDoublesEvent } from "@/lib/registration";

export default async function InvitePartnerPage({
  params,
}: {
  params: { locale: string; inviteToken: string };
}) {
  const t = await getTranslations("invitePartner");

  const invite = await prisma.partnerInvite.findUnique({
    where: { token: params.inviteToken },
    include: {
      entry: {
        include: {
          event: true,
          registration: { include: { player: true, tournament: true } },
          teamMembers: { include: { player: true } },
        },
      },
    },
  });

  if (!invite) {
    return (
      <main>
        <h1>{t("invalidTitle")}</h1>
        <p>{t("invalidCopy")}</p>
      </main>
    );
  }

  const tournament = invite.entry.registration.tournament;
  const inviter = invite.entry.registration.player;
  const waiver = await prisma.waiverVersion.findFirst({
    where: { tournamentId: tournament.id, isActive: true },
  });

  const waiverTitle =
    params.locale === "es-MX" ? waiver?.titleEs : waiver?.titleEn;
  const waiverBody =
    params.locale === "es-MX" ? waiver?.bodyEsMx : waiver?.bodyEn;

  async function handleAccept(formData: FormData) {
    "use server";

    const token = String(formData.get("token") || "").trim();
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const accepted = formData.get("accepted") === "on";

    if (!token || !firstName || !lastName || !email || !accepted) {
      return;
    }

    const inviteRecord = await prisma.partnerInvite.findUnique({
      where: { token },
      include: {
        entry: {
          include: {
            event: true,
            registration: true,
            teamMembers: true,
          },
        },
      },
    });

    if (!inviteRecord || !isDoublesEvent(inviteRecord.entry.event.eventType)) {
      return;
    }

    const player = await prisma.player.upsert({
      where: { email },
      update: { firstName, lastName },
      create: { firstName, lastName, email },
    });

    const manageToken = generateToken();

    await prisma.$transaction(async (tx) => {
      await tx.registration.create({
        data: {
          tournamentId: inviteRecord.entry.registration.tournamentId,
          playerId: player.id,
          manageToken,
        },
      });

      const existingMember = inviteRecord.entry.teamMembers.find(
        (member) => member.playerId === player.id,
      );

      if (!existingMember) {
        await tx.teamMember.create({
          data: {
            entryId: inviteRecord.entry.id,
            playerId: player.id,
          },
        });
      }

      await tx.eventEntry.update({
        where: { id: inviteRecord.entry.id },
        data: { status: "COMPLETE" },
      });

      await tx.partnerInvite.delete({
        where: { id: inviteRecord.id },
      });
    });

    redirect(
      `/${params.locale}/inscripcion/confirmacion?manageToken=${manageToken}&fromInvite=1`,
    );
  }

  async function handleDecline(formData: FormData) {
    "use server";

    const token = String(formData.get("token") || "").trim();

    if (!token) {
      return;
    }

    const inviteRecord = await prisma.partnerInvite.findUnique({
      where: { token },
      include: { entry: true },
    });

    if (!inviteRecord) {
      return;
    }

    await prisma.$transaction(async (tx) => {
      if (inviteRecord.entry.status !== "COMPLETE") {
        await tx.eventEntry.update({
          where: { id: inviteRecord.entryId },
          data: { status: "NEED_PARTNER" },
        });
      }

      await tx.partnerInvite.delete({
        where: { id: inviteRecord.id },
      });
    });

    redirect(`/${params.locale}/invitar/${params.inviteToken}`);
  }

  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{t("tournamentLabel", { tournament: tournament.name })}</p>
      <p>{t("eventLabel", { event: invite.entry.event.name })}</p>
      <p>
        {t("inviterLabel", {
          name: `${inviter.firstName} ${inviter.lastName}`,
        })}
      </p>

      <section>
        <h2>{t("acceptTitle")}</h2>
        <form action={handleAccept}>
          <input type="hidden" name="token" value={params.inviteToken} />
          <label htmlFor="firstName">{t("firstName")}</label>
          <input id="firstName" name="firstName" type="text" required />
          <label htmlFor="lastName">{t("lastName")}</label>
          <input id="lastName" name="lastName" type="text" required />
          <label htmlFor="email">{t("email")}</label>
          <input id="email" name="email" type="email" required />
          {waiverTitle && waiverBody ? (
            <article>
              <h3>{waiverTitle}</h3>
              {waiverBody.split("\n\n").map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ) : null}
          <label>
            <input type="checkbox" name="accepted" required />
            {t("acceptWaiver")}
          </label>
          <button type="submit">{t("acceptButton")}</button>
        </form>
      </section>

      <section>
        <h2>{t("declineTitle")}</h2>
        <form action={handleDecline}>
          <input type="hidden" name="token" value={params.inviteToken} />
          <button type="submit">{t("declineButton")}</button>
        </form>
      </section>
    </main>
  );
}
