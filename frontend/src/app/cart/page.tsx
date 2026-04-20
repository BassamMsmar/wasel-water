"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cartTotal, readCart } from "@/lib/cart";
import { absoluteMediaUrl, money } from "@/lib/media";
import type { CartItem } from "@/lib/types";
import { QuantityButton } from "@/components/QuantityButton";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const update = () => setItems(readCart());
    update();
    window.addEventListener("cart:changed", update);
    return () => window.removeEventListener("cart:changed", update);
  }, []);

  const total = useMemo(() => cartTotal(items), [items]);

  return (
    <section className="page-shell">
      <div className="page-heading">
        <span className="eyebrow">السلة</span>
        <h1>راجع طلبك قبل الإرسال</h1>
        <p>تحكم بالكميات وتابع لإكمال بيانات التوصيل.</p>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <article key={item.product.id} className="cart-item">
              <Image src={absoluteMediaUrl(item.product.image)} alt={item.product.name} width={96} height={96} />
              <div>
                <h2>{item.product.name}</h2>
                <p>{money(item.product.new_price ?? item.product.price)}</p>
              </div>
              <div className="quantity-control">
                <QuantityButton productId={item.product.id} quantity={item.quantity} delta={-1} />
                <span>{item.quantity}</span>
                <QuantityButton productId={item.product.id} quantity={item.quantity} delta={1} />
              </div>
            </article>
          ))}
          {!items.length ? <p className="empty-state">السلة فارغة حاليا.</p> : null}
        </div>

        <aside className="summary-box">
          <h2>ملخص الطلب</h2>
          <div>
            <span>الإجمالي</span>
            <strong>{money(total)}</strong>
          </div>
          <Link href="/checkout" className={items.length ? "checkout-link" : "checkout-link disabled"}>
            متابعة الدفع
          </Link>
        </aside>
      </div>
    </section>
  );
}
