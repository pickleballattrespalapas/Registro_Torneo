import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getTournament } from "@/lib/registration";

export default async function RegistrationWaiverPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { manageToken?: string; level?: string };
}) {
  const t = await getTranslations("registrationWaiver");
  const manageToken = searchParams.manageToken;
  const level = searchParams.level ?? "";
  const tournament = await getTournament();
  const waiver = tournament?.waivers[0];

  async function handleSubmit(formData: FormData) {
    "use server";

    const token = String(formData.get("manageToken") || "").trim();
    const selectedLevel = String(formData.get("level") || "").trim();
    const accepted = formData.get("accepted") === "on";

    if (!token || !accepted) {
      return;
    }

    const query = new URLSearchParams({ manageToken: token, level: selectedLevel });
    redirect(`/${params.locale}/inscripcion/confirmacion?${query.toString()}`);
  }

  if (!manageToken || !waiver) {
    return (
      <main>
        <h1>{t("missingTitle")}</h1>
        <p>{t("missingCopy")}</p>
      </main>
    );
  }

  const waiverTitle = params.locale === "es-MX" ? waiver.titleEs : waiver.titleEn;
  const waiverBody = params.locale === "es-MX" ? waiver.bodyEsMx : waiver.bodyEn;

  return (
    <main>
      <h1>{t("title")}</h1>
      <article>
        <h2>{waiverTitle}</h2>
        {waiverBody.split("\n\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>
      <form action={handleSubmit}>
        <input type="hidden" name="manageToken" value={manageToken} />
        <input type="hidden" name="level" value={level} />
        <label>
          <input type="checkbox" name="accepted" required />
          {t("accept")}
        </label>
        <button type="submit">{t("continue")}</button>
      </form>
    </main>
  );
}
