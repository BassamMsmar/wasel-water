import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000"),
  title: {
    default: "واصل للمياه | متجر المياه",
    template: "%s | واصل للمياه"
  },
  description: "متجر مياه سريع وخفيف لطلب المنتجات والبراندات والعروض من أقرب فرع.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "واصل للمياه",
    description: "منتجات مياه، عروض، براندات، وتجربة طلب واضحة.",
    locale: "ar_SA",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
