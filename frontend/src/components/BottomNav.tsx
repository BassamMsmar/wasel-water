"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { readCart } from "@/lib/cart";

export function BottomNav() {
  const [count, setCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const updateCart = () => setCount(readCart().reduce((total, item) => total + item.quantity, 0));
    const updateAuth = () => setLoggedIn(isLoggedIn());

    updateCart();
    updateAuth();
    window.addEventListener("cart:changed", updateCart);
    window.addEventListener("storage", updateCart);
    window.addEventListener("auth:changed", updateAuth);

    return () => {
      window.removeEventListener("cart:changed", updateCart);
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("auth:changed", updateAuth);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  function openAuthModal() {
    window.dispatchEvent(new Event("auth:open"));
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#d9e4ef] bg-white/95 px-2 py-2 backdrop-blur md:hidden" aria-label="التنقل السريع">
      <div className="grid grid-cols-5 gap-1">
        <Link href="/" className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold transition ${isActive("/") ? "bg-[#eef6ff] text-[#2d78c8]" : "text-[#647688]"}`}>
          <span>الرئيسية</span>
        </Link>
        <Link href="/products" className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold transition ${isActive("/products") ? "bg-[#eef6ff] text-[#2d78c8]" : "text-[#647688]"}`}>
          <span>المنتجات</span>
        </Link>
        <Link href="/brands" className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold transition ${isActive("/brands") ? "bg-[#eef6ff] text-[#2d78c8]" : "text-[#647688]"}`}>
          <span>العلامات</span>
        </Link>
        <Link href="/cart" className={`relative flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold transition ${isActive("/cart") ? "bg-[#eef6ff] text-[#2d78c8]" : "text-[#647688]"}`}>
          <span>السلة</span>
          {count > 0 ? <span className="absolute right-4 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#2d78c8] px-1 text-[10px] font-black text-white">{count}</span> : null}
        </Link>
        {loggedIn ? (
          <Link href="/dashboard" className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold transition ${isActive("/dashboard") ? "bg-[#eef6ff] text-[#2d78c8]" : "text-[#647688]"}`}>
            <span>حسابي</span>
          </Link>
        ) : (
          <button type="button" onClick={openAuthModal} className="flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold text-[#647688] transition hover:bg-[#eef6ff] hover:text-[#2d78c8]">
            <span>دخول</span>
          </button>
        )}
      </div>
    </nav>
  );
}
