import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";

import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "WMA Platform | แพลตฟอร์มการสื่อสารดิจิทัลเพื่อสนับสนุนการจัดการน้ำเสียชุมชน",
  description: "Digital Communication Platform for Smart Community Wastewater Management",
};

const locales = ["th", "en"];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();
  const messages = (await import(`../../../messages/${locale}.json`)).default;
  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-surface">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
