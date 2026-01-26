import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main>
      <h1>{t("headline")}</h1>
      <p>{t("subtitle")}</p>
      <button type="button">{t("cta")}</button>
    </main>
  );
}
