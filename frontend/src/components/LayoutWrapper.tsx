"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { FloatingWhatsApp } from "./FloatingWhatsApp";
import { LocationPrompt } from "./LocationPrompt";
import { AuthModal } from "./AuthModal";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const isDashboard = pathname?.startsWith("/dashboard");

  useEffect(() => {
    const openAuth = () => setAuthOpen(true);
    window.addEventListener("auth:open", openAuth);
    return () => window.removeEventListener("auth:open", openAuth);
  }, []);

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
      <LocationPrompt />
      {/* We keep BottomNav hidden or adapted for Mobile in the redesign */}
      <div className="md:hidden">
        <BottomNav />
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
