"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    window.dispatchEvent(new Event("auth:open"));
    router.replace("/");
  }, [router]);

  return (
    <section className="grid min-h-[50vh] place-items-center bg-[#f7fbff]" dir="rtl">
      <div className="text-sm font-bold text-[#617386]">جاري فتح نافذة تسجيل الدخول...</div>
    </section>
  );
}
