"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { cartTotal, readCart, updateCartQuantity } from "@/lib/cart";
import { absoluteMediaUrl, fallbackProductImage, money } from "@/lib/media";
import type { CartItem } from "@/lib/types";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const update = () => setItems(readCart());
    update();
    window.addEventListener("cart:changed", update);
    return () => window.removeEventListener("cart:changed", update);
  }, []);

  const total = useMemo(() => cartTotal(items), [items]);

  const changeQty = (id: number, delta: number) => {
    const item = items.find(i => i.product.id === id);
    if (!item) return;
    updateCartQuantity(id, item.quantity + delta);
  };

  const removeFromCart = (id: number) => updateCartQuantity(id, 0);

  return (
    <>
      <div className="page-hero">
        <span className="eyebrow">السلة</span>
        <h1>راجع طلبك قبل الإرسال</h1>
        <p>تحكم بالكميات ثم تابع لإكمال التوصيل.</p>
      </div>

      <section className="page-shell">
        {items.length === 0 ? (
          <div className="empty-state" style={{ maxWidth: 480, margin: "0 auto" }}>
            <div className="empty-icon">السلة</div>
            <h3>سلتك فارغة</h3>
            <p>لم تضف أي منتج بعد. تصفح منتجاتنا الرائعة!</p>
            <Link href="/products" className="btn btn-primary" style={{ marginTop: "1.25rem" }}>
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items */}
            <div className="cart-items-list">
              {items.map(item => (
                <article key={item.product.id} className="cart-item-card">
                  <SafeImage
                    src={absoluteMediaUrl(item.product.image)}
                    fallback={fallbackProductImage}
                    alt={item.product.name}
                    width={100} height={100}
                    className="cart-item-image"
                  />
                  <div>
                    <div className="cart-item-name">{item.product.name}</div>
                    <div className="cart-item-price">
                      {money(item.product.new_price ?? item.product.price)}
                      {item.quantity > 1 && (
                        <span style={{ color:"var(--text-muted)", fontSize:".82rem", marginInlineStart:".4rem" }}>
                          × {item.quantity} = {money(Number(item.product.new_price ?? item.product.price) * item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:".5rem" }}>
                    <div className="qty-stepper">
                      <button type="button" className="qty-btn" aria-label="تقليل" onClick={() => changeQty(item.product.id, -1)}>−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button type="button" className="qty-btn" aria-label="زيادة" onClick={() => changeQty(item.product.id, +1)}>+</button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      style={{ background:"none", border:"none", color:"var(--danger)", cursor:"pointer", fontSize:".8rem", fontWeight:700, padding:".25rem" }}
                    >
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Summary */}
            <aside className="order-summary-box">
              <div className="order-summary-title">ملخص الطلب</div>
              {items.map(item => (
                <div key={item.product.id} className="summary-item">
                  <span className="summary-item-name">{item.product.name} × {item.quantity}</span>
                  <span className="summary-item-price">
                    {money(Number(item.product.new_price ?? item.product.price) * item.quantity)}
                  </span>
                </div>
              ))}
              <hr className="summary-divider" />
              <div className="summary-total">
                <span>الإجمالي</span>
                <span className="summary-total-price">{money(total)}</span>
              </div>
              <div style={{ marginTop:"1.25rem", display:"grid", gap:".75rem" }}>
                <Link href="/checkout" className="btn btn-primary btn-lg btn-block">
                  متابعة الدفع ←
                </Link>
                <Link href="/products" className="btn btn-secondary btn-block" style={{ textAlign:"center" }}>
                  متابعة التسوق
                </Link>
              </div>
              <div className="delivery-hint" style={{ marginTop:"1rem" }}>
                <span>دفع آمن عند الاستلام</span>
              </div>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
