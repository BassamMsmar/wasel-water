import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000"),
  title: {
    default: "واصل للمياه | متجر المياه السعودي",
    template: "%s | واصل للمياه"
  },
  description: "متجر واصل للمياه — طلب مياه سريع وموثوق بأفضل البراندات في السعودية. توصيل لباب البيت.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "واصل للمياه",
    description: "أفضل براندات المياه بتوصيل سريع لباب بيتك",
    locale: "ar_SA",
    type: "website"
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
