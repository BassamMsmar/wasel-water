"use client";

import { useEffect, useState } from "react";
import { getCompanies } from "@/lib/api";

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.61 2 2.2 6.4 2.2 11.83c0 1.74.45 3.44 1.31 4.94L2 22l5.38-1.41a9.8 9.8 0 0 0 4.67 1.19h.01c5.42 0 9.83-4.41 9.83-9.84 0-2.63-1.03-5.1-2.84-6.93Zm-7.01 15.2h-.01a8.1 8.1 0 0 1-4.14-1.14l-.3-.18-3.19.84.85-3.11-.2-.32a8.1 8.1 0 0 1-1.25-4.36c0-4.48 3.65-8.13 8.15-8.13 2.17 0 4.2.84 5.74 2.39a8.08 8.08 0 0 1 2.38 5.75c0 4.48-3.65 8.13-8.13 8.13Zm4.46-6.1c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.24-.61.77-.75.93-.14.16-.28.18-.52.06-.24-.12-1-.37-1.92-1.18-.71-.63-1.19-1.4-1.33-1.64-.14-.24-.02-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.49-.4-.42-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.15 1.52.09.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

export function FloatingWhatsApp() {
  const [whatsAppLink, setWhatsAppLink] = useState<string | null>(null);

  useEffect(() => {
    getCompanies()
      .then((companies) => {
        const raw = companies[0]?.whatsapp?.replace(/[^\d]/g, "") || "";
        if (!raw) return;
        setWhatsAppLink(`https://wa.me/${raw}`);
      })
      .catch(() => setWhatsAppLink(null));
  }, []);

  if (!whatsAppLink) return null;

  return (
    <a
      href={whatsAppLink}
      target="_blank"
      rel="noreferrer"
      aria-label="راسلنا عبر واتساب"
      className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#20c863] text-white shadow-[0_4px_18px_rgba(32,200,99,0.18)] transition hover:scale-[1.03] hover:bg-[#17b557] md:bottom-6 md:left-6"
    >
      <WhatsAppIcon />
    </a>
  );
}
