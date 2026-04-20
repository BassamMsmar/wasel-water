"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart } from "@/lib/cart";
import { isLoggedIn, getProfile } from "@/lib/auth";

export function Header() {
  const [count, setCount]     = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [initial, setInitial] = useState("م");

  useEffect(() => {
    const updateCart = () =>
      setCount(readCart().reduce((t, i) => t + i.quantity, 0));
    updateCart();
    window.addEventListener("cart:changed", updateCart);
    window.addEventListener("storage",      updateCart);

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
      window.removeEventListener("cart:changed", updateCart);
      window.removeEventListener("storage",      updateCart);
      window.removeEventListener("auth:changed", updateAuth);
    };
  }, []);

  return (
    <header className="site-header">
      {/* Top Banner */}
      <div className="header-top">
        🚚 توصيل مجاني للطلبات فوق 100 ريال ·{" "}
        <a href="https://wa.me/9660000000000" target="_blank" rel="noreferrer">
          تواصل عبر واتساب
        </a>
      </div>

      {/* Main Nav */}
      <div className="header-main">
        {/* Logo */}
        <Link href="/" className="brand-mark" aria-label="واصل للمياه - الصفحة الرئيسية">
          <span className="brand-logo-icon">و</span>
          <span className="brand-mark-text">
            <strong>واصل للمياه</strong>
            <small>متجر المياه السعودي</small>
          </span>
        </Link>

        {/* Search */}
        <form className="header-search" action="/products" role="search">
          <input
            name="search"
            placeholder="ابحث عن منتج، براند، أو تصنيف..."
            aria-label="بحث في المتجر"
            autoComplete="off"
          />
          <button type="submit" aria-label="بحث">بحث</button>
        </form>

        {/* Links */}
        <nav className="header-nav" aria-label="روابط التنقل">
          <Link href="/products" className="nav-link">المنتجات</Link>
          <Link href="/brands"   className="nav-link">البراندات</Link>

          <Link href="/cart" className="cart-nav-btn" aria-label={`السلة — ${count} عناصر`}>
            🛒
            <span className="cart-count-badge" aria-live="polite">{count}</span>
          </Link>

          {loggedIn ? (
            <Link href="/dashboard" className="nav-avatar" aria-label="حسابي ولوحة التحكم" title="حسابي">
              {initial}
            </Link>
          ) : (
            <Link href="/login" className="nav-login-btn" id="header-login-btn">
              👤 دخول
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
