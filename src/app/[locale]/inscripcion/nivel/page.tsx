import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function RegistrationLevelPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { manageToken?: string };
}) {
  const t = await getTranslations("registrationLevel");
  const manageToken = searchParams.manageToken;

  async function handleSubmit(formData: FormData) {
    "use server";

    const level = String(formData.get("level") || "").trim();
    const token = String(formData.get("manageToken") || "").trim();

    if (!level || !token) {
      return;
    }

    const query = new URLSearchParams({ manageToken: token, level });
    redirect(`/${params.locale}/inscripcion/eventos?${query.toString()}`);
  }

  if (!manageToken) {
    return (
      <main>
        <h1>{t("missingTitle")}</h1>
        <p>{t("missingCopy")}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{t("subtitle")}</p>
      <form action={handleSubmit}>
        <input type="hidden" name="manageToken" value={manageToken} />
        <label>
          <input type="radio" name="level" value="3.0" required />
          {t("level30")}
        </label>
        <label>
          <input type="radio" name="level" value="3.5" required />
          {t("level35")}
        </label>
        <label>
          <input type="radio" name="level" value="4.0" required />
          {t("level40")}
        </label>
        <button type="submit">{t("continue")}</button>
      </form>
    </main>
  );
}
