import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Registro Torneo",
  description: "Tournament registration app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localeCookie = cookies().get("NEXT_LOCALE")?.value;
  const lang = localeCookie === "es-MX" ? "es-MX" : "en";

  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
