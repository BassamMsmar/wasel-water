"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cartTotal, readCart } from "@/lib/cart";
import { money } from "@/lib/media";
import type { CartItem } from "@/lib/types";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sent, setSent] = useState(false);
  const total = useMemo(() => cartTotal(items), [items]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="page-shell checkout-shell">
      <div className="page-heading">
        <span className="eyebrow">إكمال الطلب</span>
        <h1>بيانات التوصيل</h1>
        <p>نموذج خفيف جاهز للربط مع نقطة إنشاء الطلب في Django.</p>
      </div>

      <form className="checkout-form" onSubmit={submit}>
        <label>
          الاسم الكامل
          <input name="name" autoComplete="name" required />
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
        <div className="summary-line">
          <span>إجمالي المنتجات</span>
          <strong>{money(total)}</strong>
        </div>
        <button type="submit" className="primary-action wide" disabled={!items.length}>
          إرسال الطلب
        </button>
        {sent ? <p className="success-note">تم تجهيز الطلب في الواجهة. اربط نقطة API لإنشاء الطلب لإرساله للنظام.</p> : null}
        {!items.length ? <Link href="/products">اختر منتجات أولا</Link> : null}
      </form>
    </section>
  );
}
