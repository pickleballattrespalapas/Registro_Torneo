"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export default function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("header");

  const buildHref = (nextLocale: string) => {
    const segments = pathname.split("/");
    if (segments.length > 1) {
      segments[1] = nextLocale;
    }
    const nextPath = segments.join("/") || `/${nextLocale}`;
    const query = searchParams.toString();

    return query ? `${nextPath}?${query}` : nextPath;
  };

  const handleLocaleClick = (nextLocale: string) => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
  };

  return (
    <header>
      <nav>
        <span>{t("languageLabel")}: </span>
        <Link
          href={buildHref("en")}
          aria-current={locale === "en" ? "page" : undefined}
          onClick={() => handleLocaleClick("en")}
        >
          {t("english")}
        </Link>
        {" | "}
        <Link
          href={buildHref("es-MX")}
          aria-current={locale === "es-MX" ? "page" : undefined}
          onClick={() => handleLocaleClick("es-MX")}
        >
          {t("spanish")}
        </Link>
      </nav>
    </header>
  );
}
