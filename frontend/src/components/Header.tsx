"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { canAccessDashboard, getProfile, isLoggedIn, logout } from "@/lib/auth";
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
  const [cartPulse, setCartPulse] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
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

    const onCartAdded = () => {
      setCartPulse(true);
      window.setTimeout(() => setCartPulse(false), 650);
    };

    updateCart();
    updateAuth();
    getCompanies().then((companies) => setCompany(companies[0] ?? null)).catch(() => setCompany(null));
    const savedTheme = localStorage.getItem("wasel-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      document.documentElement.dataset.theme = savedTheme;
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(document.documentElement.dataset.theme === "dark");
    }

    window.addEventListener("cart:changed", updateCart);
    window.addEventListener("cart:added", onCartAdded);
    window.addEventListener("storage", updateCart);
    window.addEventListener("auth:changed", updateAuth);
    window.addEventListener("mousedown", onPointerDown);

    return () => {
      window.removeEventListener("cart:changed", updateCart);
      window.removeEventListener("cart:added", onCartAdded);
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("auth:changed", updateAuth);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  const initial = (user?.first_name?.[0] || user?.username?.[0] || "و").toUpperCase();
  const showDashboard = canAccessDashboard(user);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
  }

  function toggleTheme() {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
    localStorage.setItem("wasel-theme", nextDark ? "dark" : "light");
  }

  function openAuthModal() {
    window.dispatchEvent(new Event("auth:open"));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e6eef5] bg-white/92 backdrop-blur dark:border-[#1e344a] dark:bg-[#0b1a27]/92">
      <div className="site-container flex min-h-[76px] items-center justify-between gap-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="واصل لتوزيع المياه">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-transparent">
            <Image
              src={absoluteMediaUrl(company?.logo || "/media/images/logo.png")}
              alt={company?.name || "شعار واصل"}
              width={44}
              height={44}
              unoptimized
              className="h-11 w-11 object-contain"
            />
          </div>
          <div className="min-w-0">
            <strong className="block truncate text-base font-black text-[#102231] sm:text-lg dark:text-[#eef5fb]">
              {company?.name || "واصل لتوزيع المياه"}
            </strong>
            <span className="hidden text-xs font-semibold text-[#7f91a3] sm:block dark:text-[#9db3c7]">
              {company?.title || "واصل - المياه الصحية"}
            </span>
          </div>
        </Link>

        <form action="/products" className="hidden flex-1 md:flex md:max-w-[520px]">
          <div className="relative w-full">
            <input
              name="search"
              placeholder="ابحث عن منتج أو علامة تجارية أو قسم"
              className="h-12 w-full rounded-full border border-[#dbe7f2] bg-[#f9fcff] px-5 pr-14 text-sm font-semibold text-[#102231] outline-none transition placeholder:text-[#9aacbe] focus:border-[#b5d0ea] focus:bg-white dark:border-[#1e344a] dark:bg-[#08111b] dark:text-[#eef5fb] dark:focus:border-[#2a4d70] dark:focus:bg-[#0b1a27]"
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
          <button type="button" onClick={toggleTheme} className="hidden h-10 w-10 items-center justify-center rounded-full text-[#476074] transition hover:bg-[#f3f8fc] hover:text-[#123e67] lg:flex dark:text-[#9db3c7] dark:hover:bg-[#0f2133] dark:hover:text-[#eef5fb]" aria-label="تبديل المظهر">
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>

          <Link href="/products" className="hidden rounded-full px-3 py-2 text-sm font-bold text-[#5f7386] transition hover:bg-[#f3f8fc] hover:text-[#102231] lg:inline-flex dark:text-[#9db3c7] dark:hover:bg-[#0f2133] dark:hover:text-[#eef5fb]">
            المنتجات
          </Link>
          <Link href="/brands" className="hidden rounded-full px-3 py-2 text-sm font-bold text-[#5f7386] transition hover:bg-[#f3f8fc] hover:text-[#102231] lg:inline-flex dark:text-[#9db3c7] dark:hover:bg-[#0f2133] dark:hover:text-[#eef5fb]">
            العلامات
          </Link>

          <div className="relative" ref={menuRef}>
            {loggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => setMenuOpen((current) => !current)}
                  className="flex items-center gap-2 rounded-full border border-[#dbe7f2] bg-white px-2 py-1.5 text-[#476074] transition hover:bg-[#f3f8fc] hover:text-[#123e67] dark:border-[#1e344a] dark:bg-[#0b1a27] dark:text-[#9db3c7] dark:hover:bg-[#0f2133] dark:hover:text-[#eef5fb]"
                  aria-label="قائمة الحساب"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ddebff] text-xs font-black text-[#123e67] dark:bg-[#123e67] dark:text-[#eef5fb]">
                    {initial}
                  </span>
                  <span className="hidden text-sm font-black text-[#102231] md:inline dark:text-[#eef5fb]">
                    {user?.first_name || user?.username || "حسابي"}
                  </span>
                </button>

                {menuOpen ? (
                  <div className="absolute left-0 top-[calc(100%+0.75rem)] min-w-[230px] rounded-[22px] border border-[#dde8f3] bg-white p-2 shadow-[0_20px_40px_rgba(10,34,56,0.12)] dark:border-[#1e344a] dark:bg-[#0b1a27] dark:shadow-none">
                    <div className="border-b border-[#edf3f8] px-3 pb-3 pt-2 dark:border-[#1e344a]">
                      <div className="text-sm font-black text-[#102231] dark:text-[#eef5fb]">
                        {user?.first_name || user?.username}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-[#7f91a3] dark:text-[#9db3c7]">
                        {user?.email || "حساب المستخدم"}
                      </div>
                    </div>

                    <div className="grid gap-1 px-1 py-2">
                      <Link href="/cart" onClick={() => setMenuOpen(false)} className="rounded-2xl px-3 py-2.5 text-sm font-bold text-[#41596d] transition hover:bg-[#f3f8fc] hover:text-[#102231] dark:text-[#9db3c7] dark:hover:bg-[#0f2133] dark:hover:text-[#eef5fb]">
                        السلة
                      </Link>
                      {showDashboard ? (
                        <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="rounded-2xl bg-[#eef6ff] px-3 py-2.5 text-sm font-black text-[#1f69b1] transition hover:bg-[#e4f0ff] dark:bg-[#123e67] dark:text-[#eef5fb] dark:hover:bg-[#1d639f]">
                          إدارة المتجر
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-2xl px-3 py-2.5 text-right text-sm font-bold text-[#c44949] transition hover:bg-[#fff3f3] dark:text-[#ff6b6b] dark:hover:bg-[#4a1c1c]"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <button type="button" onClick={openAuthModal} className="flex h-10 w-10 items-center justify-center rounded-full text-[#476074] transition hover:bg-[#f3f8fc] hover:text-[#123e67] dark:text-[#9db3c7] dark:hover:bg-[#0f2133] dark:hover:text-[#eef5fb]" aria-label="تسجيل الدخول">
                <UserIcon />
              </button>
            )}
          </div>

          <Link href="/cart" className={`relative flex h-10 w-10 items-center justify-center rounded-full text-[#476074] transition hover:bg-[#f3f8fc] hover:text-[#123e67] dark:text-[#9db3c7] dark:hover:bg-[#0f2133] dark:hover:text-[#eef5fb] ${cartPulse ? "cart-bounce" : ""}`} aria-label="السلة">
            <CartIcon />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#2d78c8] px-1 text-[10px] font-black text-white">
                {count}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>

      <div className="border-t border-[#edf3f8] py-3 md:hidden dark:border-[#1e344a]">
        <form action="/products" className="site-container">
          <div className="relative w-full">
            <input
              name="search"
              placeholder="ابحث عن منتج أو علامة تجارية"
              className="h-11 w-full rounded-full border border-[#dbe7f2] bg-[#f9fcff] px-4 pr-14 text-sm font-semibold text-[#102231] outline-none transition placeholder:text-[#9aacbe] focus:border-[#b5d0ea] focus:bg-white dark:border-[#1e344a] dark:bg-[#08111b] dark:text-[#eef5fb] dark:focus:border-[#2a4d70] dark:focus:bg-[#0b1a27]"
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
