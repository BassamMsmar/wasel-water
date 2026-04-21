"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getProfile, isLoggedIn, logout } from "@/lib/auth";
import { readCart } from "@/lib/cart";
import { absoluteMediaUrl } from "@/lib/media";
import { getCompanies } from "@/lib/api";
import type { Company, UserAccount } from "@/lib/types";

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 20-1.4-1.3C5.4 14 2 10.9 2 7.1 2 4.1 4.3 2 7.2 2c1.7 0 3.4.8 4.5 2.2C12.8 2.8 14.5 2 16.2 2 19.1 2 21.4 4.1 21.4 7.1c0 3.8-3.4 6.9-8.6 11.6L12 20Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 1.9-1.5L22 7H7.2" />
    </svg>
  );
}

export function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [count, setCount] = useState(0);
  const [company, setCompany] = useState<Company | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateCart = () => {
      setCount(readCart().reduce((total, item) => total + item.quantity, 0));
    };

    const updateAuth = async () => {
      const ok = isLoggedIn();
      setLoggedIn(ok);

      if (!ok) {
        setUser(null);
        return;
      }

      const profile = await getProfile();
      setUser(profile);
    };

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    updateCart();
    updateAuth();
    getCompanies().then((companies) => setCompany(companies[0] ?? null)).catch(() => setCompany(null));

    window.addEventListener("cart:changed", updateCart);
    window.addEventListener("storage", updateCart);
    window.addEventListener("auth:changed", updateAuth);
    window.addEventListener("mousedown", onPointerDown);

    return () => {
      window.removeEventListener("cart:changed", updateCart);
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("auth:changed", updateAuth);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  const initial = (user?.first_name?.[0] || user?.username?.[0] || "و").toUpperCase();

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e6eef5] bg-white/92 backdrop-blur">
      <div className="site-container flex min-h-[76px] items-center justify-between gap-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="واصل لتوزيع المياه">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[#dce8f3] bg-white shadow-[0_4px_12px_rgba(10,34,56,0.04)]">
            <Image
              src={absoluteMediaUrl(company?.logo || "/media/images/logo.png")}
              alt={company?.name || "شعار واصل"}
              width={34}
              height={34}
              unoptimized
              className="h-8.5 w-8.5 object-contain"
            />
          </div>
          <div className="min-w-0">
            <strong className="block truncate text-base font-black text-[#102231] sm:text-lg">
              {company?.name || "واصل لتوزيع المياه"}
            </strong>
            <span className="hidden text-xs font-semibold text-[#7f91a3] sm:block">
              {company?.title || "متجر مياه موثوق للأفراد والشركات والمنشآت"}
            </span>
          </div>
        </Link>

        <form action="/products" className="hidden flex-1 md:flex md:max-w-[520px]">
          <div className="relative w-full">
            <input
              name="search"
              placeholder="ابحث عن منتج أو علامة تجارية أو قسم"
              className="h-12 w-full rounded-full border border-[#dbe7f2] bg-[#f9fcff] px-5 pr-14 text-sm font-semibold text-[#102231] outline-none transition placeholder:text-[#9aacbe] focus:border-[#b5d0ea] focus:bg-white"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#2d78c8] text-white transition hover:bg-[#123e67]"
              aria-label="بحث"
            >
              <SearchIcon />
            </button>
          </div>
        </form>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/products" className="hidden rounded-full px-3 py-2 text-sm font-bold text-[#5f7386] transition hover:bg-[#f3f8fc] hover:text-[#102231] lg:inline-flex">
            المنتجات
          </Link>
          <Link href="/brands" className="hidden rounded-full px-3 py-2 text-sm font-bold text-[#5f7386] transition hover:bg-[#f3f8fc] hover:text-[#102231] lg:inline-flex">
            العلامات
          </Link>

          <Link href="/products" className="flex h-10 w-10 items-center justify-center rounded-full text-[#476074] transition hover:bg-[#f3f8fc] hover:text-[#123e67]" aria-label="المفضلة">
            <HeartIcon />
          </Link>

          <div className="relative" ref={menuRef}>
            {loggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => setMenuOpen((current) => !current)}
                  className="flex items-center gap-2 rounded-full border border-[#dbe7f2] bg-white px-2 py-1.5 text-[#476074] transition hover:bg-[#f3f8fc] hover:text-[#123e67]"
                  aria-label="قائمة الحساب"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ddebff] text-xs font-black text-[#123e67]">
                    {initial}
                  </span>
                  <span className="hidden text-sm font-black text-[#102231] md:inline">
                    {user?.first_name || user?.username || "حسابي"}
                  </span>
                </button>

                {menuOpen ? (
                  <div className="absolute left-0 top-[calc(100%+0.75rem)] min-w-[230px] rounded-[22px] border border-[#dde8f3] bg-white p-2 shadow-[0_20px_40px_rgba(10,34,56,0.12)]">
                    <div className="border-b border-[#edf3f8] px-3 pb-3 pt-2">
                      <div className="text-sm font-black text-[#102231]">
                        {user?.first_name || user?.username}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-[#7f91a3]">
                        {user?.email || "حساب المستخدم"}
                      </div>
                    </div>

                    <div className="grid gap-1 px-1 py-2">
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="rounded-2xl px-3 py-2.5 text-sm font-bold text-[#41596d] transition hover:bg-[#f3f8fc] hover:text-[#102231]">
                        لوحة التحكم
                      </Link>
                      <Link href="/cart" onClick={() => setMenuOpen(false)} className="rounded-2xl px-3 py-2.5 text-sm font-bold text-[#41596d] transition hover:bg-[#f3f8fc] hover:text-[#102231]">
                        السلة
                      </Link>
                      {user?.is_staff ? (
                        <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="rounded-2xl bg-[#eef6ff] px-3 py-2.5 text-sm font-black text-[#1f69b1] transition hover:bg-[#e4f0ff]">
                          إدارة المتجر
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-2xl px-3 py-2.5 text-right text-sm font-bold text-[#c44949] transition hover:bg-[#fff3f3]"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <Link href="/login" className="flex h-10 w-10 items-center justify-center rounded-full text-[#476074] transition hover:bg-[#f3f8fc] hover:text-[#123e67]" aria-label="الدخول">
                <UserIcon />
              </Link>
            )}
          </div>

          <Link href="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#476074] transition hover:bg-[#f3f8fc] hover:text-[#123e67]" aria-label="السلة">
            <CartIcon />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#2d78c8] px-1 text-[10px] font-black text-white">
                {count}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>

      <div className="border-t border-[#edf3f8] py-3 md:hidden">
        <form action="/products" className="site-container">
          <div className="relative w-full">
            <input
              name="search"
              placeholder="ابحث عن منتج أو علامة تجارية"
              className="h-11 w-full rounded-full border border-[#dbe7f2] bg-[#f9fcff] px-4 pr-14 text-sm font-semibold text-[#102231] outline-none transition placeholder:text-[#9aacbe] focus:border-[#b5d0ea] focus:bg-white"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#2d78c8] text-white transition hover:bg-[#123e67]"
              aria-label="بحث"
            >
              <SearchIcon />
            </button>
          </div>
        </form>
      </div>
    </header>
  );
}
