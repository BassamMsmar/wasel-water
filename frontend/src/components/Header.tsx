"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isLoggedIn, getProfile } from "@/lib/auth";

export function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [initial, setInitial] = useState("م");

  useEffect(() => {
    const updateAuth = async () => {
      const ok = isLoggedIn();
      setLoggedIn(ok);
      if (ok) {
        const p = await getProfile();
        if (p) setInitial((p.first_name?.[0] || p.username?.[0] || "م").toUpperCase());
      } else {
        setInitial("م");
      }
    };
    updateAuth();
    window.addEventListener("auth:changed", updateAuth);

    return () => {
      window.removeEventListener("auth:changed", updateAuth);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 lg:px-6">
        
        {/* RTL Right: Brand */}
        <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="WASEL WATER">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-ocean text-white flex items-center justify-center rounded-xl font-black text-xl shadow-sm">W</div>
          <span className="hidden md:block text-lg font-black tracking-widest text-[#002640]">واصل لتوزيع المياه</span>
        </Link>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-4 lg:mx-12 hidden md:block">
          <form className="relative flex items-center w-full" aria-label="البحث">
            <input 
              type="text" 
              placeholder="ابحث عن المنتجات، العلامات التجارية، حجم العبوة..." 
              className="w-full h-10 px-4 pr-4 pl-12 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-ocean/20 transition-all placeholder:text-gray-400"
            />
            <button type="submit" className="absolute left-1 top-1 bottom-1 w-12 bg-brand-ocean text-white rounded-full flex items-center justify-center hover:bg-[#002640] transition-colors" aria-label="بحث">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </form>
        </div>

        {/* RTL Left: Actions */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
          
          <Link href="/locations" className="hidden lg:flex flex-col items-center gap-1 text-gray-500 hover:text-brand-ocean transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="text-[0.6rem] font-bold">الفروع</span>
          </Link>
          
          {loggedIn ? (
            <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-500 hover:text-brand-ocean transition-colors">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-ice text-brand-ocean font-bold text-xs">
                {initial}
              </div>
              <span className="text-[0.6rem] font-bold">حسابي</span>
            </Link>
          ) : (
            <Link href="/login" className="flex flex-col items-center gap-1 text-gray-500 hover:text-brand-ocean transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span className="text-[0.6rem] font-bold">تسجيل</span>
            </Link>
          )}

          <Link href="/cart" className="flex flex-col items-center gap-1 text-gray-500 hover:text-brand-ocean transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            <span className="text-[0.6rem] font-bold">السلة</span>
            <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[0.55rem] font-bold text-white border-2 border-white">0</span>
          </Link>
          
        </div>
      </div>
    </header>
  );
}
