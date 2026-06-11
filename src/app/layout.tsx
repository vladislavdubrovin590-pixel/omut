import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { BUSINESS } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: `${BUSINESS.fullName} — детейлинг в Самаре, ${BUSINESS.address}`,
    template: `%s · ${BUSINESS.name}`,
  },
  description:
    "Детейлинг-студия «Омут» в центре Самары: полировка, химчистка, керамика, защитные покрытия. Прозрачные цены, личный кабинет, онлайн-запись. Галактионовская 49.",
  keywords: [
    "детейлинг Самара",
    "полировка авто Самара",
    "химчистка салона Самара",
    "керамика на авто Самара",
    "Омут детейлинг",
    "Галактионовская 49",
  ],
  openGraph: {
    title: `${BUSINESS.fullName} — детейлинг в Самаре`,
    description:
      "Полировка, химчистка, керамика и защита кузова. Личный кабинет и онлайн-запись.",
    type: "website",
    locale: "ru_RU",
  },
};

export const viewport: Viewport = {
  themeColor: "#05080e",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-abyss text-foam">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
