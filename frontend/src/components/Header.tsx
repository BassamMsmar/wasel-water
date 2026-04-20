"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart } from "@/lib/cart";

export function Header() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(readCart().reduce((total, item) => total + item.quantity, 0));
    update();
    window.addEventListener("cart:changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("cart:changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="top-note">توصيل مياه سريع ومرتب حسب منطقتك وفرعك</div>
      <nav className="nav-shell" aria-label="التنقل الرئيسي">
        <Link href="/" className="brand-mark" aria-label="واصل للمياه">
          <span className="brand-icon">و</span>
          <span>
            <strong>واصل للمياه</strong>
            <small>متجر المياه</small>
          </span>
        </Link>

        <form className="search-box" action="/products">
          <input name="search" placeholder="ابحث عن مياه، برند، باقة..." aria-label="بحث" />
          <button type="submit">بحث</button>
        </form>

        <div className="nav-links">
          <Link href="/products">المنتجات</Link>
          <Link href="/brands">البراندات</Link>
          <Link href="/cart" className="cart-link">
            السلة
            <span>{count}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
