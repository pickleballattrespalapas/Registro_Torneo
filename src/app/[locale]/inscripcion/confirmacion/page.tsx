import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function RegistrationConfirmationPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { manageToken?: string; fromInvite?: string };
}) {
  const t = await getTranslations("registrationConfirmation");
  const manageToken = searchParams.manageToken;

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
      <p>
        {searchParams.fromInvite === "1"
          ? t("inviteSuccess")
          : t("success")}
      </p>
      <Link href={`/${params.locale}/inscripcion/administra/${manageToken}`}>
        {t("manageLink")}
      </Link>
    </main>
  );
}
