"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCompanies } from "@/lib/api";
import { absoluteMediaUrl } from "@/lib/media";
import type { Company } from "@/lib/types";

export function Footer() {
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    getCompanies().then((companies) => setCompany(companies[0] ?? null)).catch(() => setCompany(null));
  }, []);

  return (
    <footer className="mt-14 border-t border-[#d9e4ef] bg-[#08131d] text-white" dir="rtl">
      <div className="site-container grid gap-8 py-10 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white">
              <Image
                src={absoluteMediaUrl(company?.logo || "/media/images/logo.png")}
                alt={company?.name || "شعار واصل"}
                width={34}
                height={34}
                unoptimized
                className="h-9 w-9 object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-black">{company?.name || "واصل لتوزيع المياه"}</h2>
              <p className="mt-1 text-xs font-semibold text-[#8ea0b1]">
                {company?.title || "متجر مياه مرتب وسريع"}
              </p>
            </div>
          </div>
          <p className="text-sm leading-8 text-[#9babb9]">
            {company?.description || "نوفر مياه بعلامات موثوقة مع تجربة عرض وطلب أوضح للأفراد والشركات والمنشآت."}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-base font-black">المتجر</h3>
          <nav className="flex flex-col gap-3 text-sm font-semibold text-[#9babb9]">
            <Link href="/" className="transition hover:text-white">الرئيسية</Link>
            <Link href="/products" className="transition hover:text-white">المنتجات</Link>
            <Link href="/brands" className="transition hover:text-white">العلامات التجارية</Link>
            <Link href="/cart" className="transition hover:text-white">السلة</Link>
          </nav>
        </div>

        <div>
          <h3 className="mb-4 text-base font-black">معلومات التواصل</h3>
          <div className="space-y-3 text-sm leading-8 text-[#9babb9]">
            <p>الهاتف: {company?.phone || "920000000"}</p>
            <p>واتساب: {company?.whatsapp || "0532388929"}</p>
            <p>البريد: {company?.email || "wasel.store1@gmail.com"}</p>
            <p>{company?.address || "الرياض، المملكة العربية السعودية"}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-base font-black">الدعم</h3>
          <nav className="flex flex-col gap-3 text-sm font-semibold text-[#9babb9]">
            <Link href="/checkout" className="transition hover:text-white">إتمام الطلب</Link>
            <Link href="/dashboard" className="transition hover:text-white">حسابي</Link>
            <Link href="/products?ordering=-sales_count" className="transition hover:text-white">الأكثر مبيعًا</Link>
            <Link href="/brands" className="transition hover:text-white">الشركات</Link>
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="site-container flex flex-col gap-3 py-4 text-xs font-semibold text-[#7f91a3] md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} جميع الحقوق محفوظة لـ {company?.name || "واصل لتوزيع المياه"}</span>
          <div className="flex gap-4">
            <Link href="/dashboard" className="transition hover:text-white">الحساب</Link>
            <Link href="/checkout" className="transition hover:text-white">الطلب</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
