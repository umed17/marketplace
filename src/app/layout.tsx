import type { Metadata } from "next";
import { Open_Sans, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LocaleProvider } from "@/components/LocaleProvider";
import { SupabasePublicConfig } from "@/components/SupabasePublicConfig";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const openSans = Open_Sans({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Усто — Биржаи хизматрасонӣ",
  description: "Устои лозимаро зуд ёбед. Заказ гузоред ё устои мувофиқро мустақим интихоб кунед.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tg">
      <body className={`${poppins.variable} ${openSans.variable} antialiased`}>
        <SupabasePublicConfig />
        <LocaleProvider>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
