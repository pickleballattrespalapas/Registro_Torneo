import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("home");

  return (
    <main>
      <h1>{t("headline")}</h1>
      <p>{t("subtitle")}</p>
      <Link href={`/${params.locale}/inscripcion/iniciar`}>{t("cta")}</Link>
    </main>
  );
}
