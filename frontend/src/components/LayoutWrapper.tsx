"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { FloatingWhatsApp } from "./FloatingWhatsApp";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return <main className="flex-1 w-full bg-gray-50">{children}</main>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
      <FloatingWhatsApp />
      {/* We keep BottomNav hidden or adapted for Mobile in the redesign */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
