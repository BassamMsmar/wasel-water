"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart } from "@/lib/cart";
import { isLoggedIn } from "@/lib/auth";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const [count,    setCount]    = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const updateCart = () =>
      setCount(readCart().reduce((t, i) => t + i.quantity, 0));
    updateCart();
    window.addEventListener("cart:changed", updateCart);
    window.addEventListener("storage",      updateCart);

    const updateAuth = () => setLoggedIn(isLoggedIn());
    updateAuth();
    window.addEventListener("auth:changed", updateAuth);

    return () => {
      window.removeEventListener("cart:changed", updateCart);
      window.removeEventListener("storage",      updateCart);
      window.removeEventListener("auth:changed", updateAuth);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="bottom-nav" aria-label="التنقل السريع">
      <Link href="/"         className={`bnav-item ${isActive("/") ? "active" : ""}`}>
        <span>الرئيسية</span>
      </Link>
      <Link href="/products" className={`bnav-item ${isActive("/products") ? "active" : ""}`}>
        <span>المنتجات</span>
      </Link>
      <Link href="/brands"   className={`bnav-item ${isActive("/brands") ? "active" : ""}`}>
        <span>البراندات</span>
      </Link>
      <Link href="/cart"     className={`bnav-item ${isActive("/cart") ? "active" : ""}`}>
        <span>سلتي</span>
        {count > 0 && <span className="bnav-badge">{count}</span>}
      </Link>
      <Link href={loggedIn ? "/dashboard" : "/login"}
            className={`bnav-item ${isActive("/dashboard") || isActive("/login") ? "active" : ""}`}>
        <span>{loggedIn ? "حسابي" : "دخول"}</span>
      </Link>
    </nav>
  );
}
