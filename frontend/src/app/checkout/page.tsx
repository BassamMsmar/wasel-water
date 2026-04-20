"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cartTotal, clearCart, readCart } from "@/lib/cart";
import { buildCheckoutPayload, submitCheckout } from "@/lib/checkout";
import { money } from "@/lib/media";
import type { CartItem } from "@/lib/types";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const total = useMemo(() => cartTotal(items), [items]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = buildCheckoutPayload(new FormData(event.currentTarget), items);
      const result = await submitCheckout(payload);
      clearCart();
      setItems([]);
      setOrderId(result.id);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "تعذر إرسال الطلب.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-shell checkout-shell">
      <div className="page-heading">
        <span className="eyebrow">إكمال الطلب</span>
        <h1>بيانات التوصيل</h1>
        <p>أرسل الطلب مباشرة إلى النظام ليظهر في لوحة التحكم.</p>
      </div>

      <form className="checkout-form" onSubmit={submit}>
        <label>
          الاسم الكامل
          <input name="full_name" autoComplete="name" required />
        </label>
        <label>
          رقم الجوال
          <input name="phone" autoComplete="tel" inputMode="tel" required />
        </label>
        <label>
          المدينة
          <input name="city" autoComplete="address-level2" required />
        </label>
        <label>
          العنوان
          <textarea name="address" rows={4} required />
        </label>
        <label>
          رابط الموقع
          <input name="location_link" inputMode="url" placeholder="اختياري" />
        </label>
        <label>
          ملاحظات الطلب
          <textarea name="note" rows={3} placeholder="اختياري" />
        </label>
        <div className="summary-line">
          <span>إجمالي المنتجات</span>
          <strong>{money(total)}</strong>
        </div>
        <button type="submit" className="primary-action wide" disabled={!items.length || loading}>
          {loading ? "جار إرسال الطلب..." : "إرسال الطلب"}
        </button>
        {orderId ? <p className="success-note">تم استلام الطلب رقم #{orderId} بنجاح.</p> : null}
        {error ? <p className="error-note">{error}</p> : null}
        {!items.length ? <Link href="/products">اختر منتجات أولا</Link> : null}
      </form>
    </section>
  );
}
