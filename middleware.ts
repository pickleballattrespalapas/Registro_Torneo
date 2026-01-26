import createMiddleware from "next-intl/middleware";

import { locales } from "./src/i18n";

export default createMiddleware({
  defaultLocale: "en",
  localePrefix: "always",
  locales,
});

export const config = {
  matcher: ["/", "/(en|es-MX)/:path*"],
};
