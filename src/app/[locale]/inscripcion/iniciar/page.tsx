import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function RegistrationStartPage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("registrationStart");

  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <Link href={`/${params.locale}/inscripcion/jugador`}>
        {t("cta")}
      </Link>
    </main>
  );
}
