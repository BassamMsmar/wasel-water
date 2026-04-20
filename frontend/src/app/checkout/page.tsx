"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { cartTotal, clearCart, readCart } from "@/lib/cart";
import { buildCheckoutPayload, submitCheckout } from "@/lib/checkout";
import { absoluteMediaUrl, money } from "@/lib/media";
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
      window.scrollTo(0, 0); // التمرير لأعلى لرؤية رسالة النجاح
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "تعذر إرسال الطلب.");
    } finally {
      setLoading(false);
    }
  }

  // ─── SUCCESS STATE ──────────────────────────────────────────────────────────
  if (orderId) {
    return (
      <section className="page-shell">
        <div className="order-success">
          <div className="success-icon-wrap">تم</div>
          <h2>تم استلام طلبك بنجاح!</h2>
          <div className="order-number-tag">طلب رقم #{orderId}</div>
          <p>شكراً لثقتك بواصل للمياه. سنقوم بمعالجة طلبك والتواصل معك قريباً لتأكيد التوصيل.</p>
          
          <div className="success-actions">
            <a 
              href={`https://wa.me/9660000000000?text=مرحباً، أود تتبع الطلب رقم ${orderId}`} 
              className="btn btn-whatsapp"
              target="_blank" rel="noreferrer"
            >
              تتبع عبر واتساب
            </a>
            <Link href="/products" className="btn btn-secondary">
              متابعة التسوق
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ─── CHECKOUT STATE ─────────────────────────────────────────────────────────
  return (
    <>
      <div className="page-hero">
        <span className="eyebrow">إكمال الطلب</span>
        <h1>بيانات التوصيل</h1>
        <p>الخطوة الأخيرة! أدخل بياناتك لنصلك في أسرع وقت.</p>
      </div>

      <section className="page-shell">
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">السلة</div>
            <h3>السلة فارغة</h3>
            <p>لا توجد منتجات لشرائها حالياً.</p>
            <Link href="/products" className="btn btn-primary" style={{ marginTop: "1rem" }}>العودة للمنتجات</Link>
          </div>
        ) : (
          <div className="checkout-layout">
            
            {/* Form */}
            <div className="checkout-form-section">
              <div className="checkout-section-title">عنوان التوصيل والتواصل</div>
              
              <form id="checkout-form" className="form-grid" onSubmit={submit}>
                <div className="form-group">
                  <label className="form-label">الاسم الكامل</label>
                  <input name="full_name" className="form-input" autoComplete="name" required placeholder="محمد عبدالله" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">رقم الجوال</label>
                  <input 
                    name="phone" 
                    className="form-input" 
                    autoComplete="tel" 
                    inputMode="tel" 
                    required 
                    placeholder="05XXXXXXXX"
                    pattern="^(05|5)(5|0|3|6|4|9|1|8|7)[0-9]{7}$"
                    title="يجب أن يكون رقم جوال سعودي صحيح يبدأ بـ 05"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">المدينة</label>
                  <select name="city" className="form-select" required defaultValue="">
                    <option value="" disabled>اختر مدينتك...</option>
                    <option value="الرياض">الرياض</option>
                    <option value="جدة">جدة</option>
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                    <option value="الدمام">الدمام</option>
                    <option value="الخبر">الخبر</option>
                    <option value="تبوك">تبوك</option>
                    <option value="أبها">أبها</option>
                    <option value="أخرى">مدينة أخرى</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">العنوان التفصيلي</label>
                  <textarea name="address" className="form-textarea" rows={3} required placeholder="اسم الحي، الشارع، رقم المبنى..." />
                </div>

                <div className="form-group">
                  <label className="form-label">رابط الموقع (Google Maps) <span className="optional">(اختياري ولكن يسرّع التوصيل)</span></label>
                  <input name="location_link" className="form-input" inputMode="url" placeholder="https://maps.google.com/..." />
                </div>

                <div className="form-group">
                  <label className="form-label">ملاحظات الطلب <span className="optional">(اختياري)</span></label>
                  <textarea name="note" className="form-textarea" rows={2} placeholder="أي تعليمات خاصة للمندوب؟" />
                </div>

                {error && (
                  <div className="alert alert-error" style={{ marginTop: "1rem" }}>
                    <span>تنبيه</span> {error}
                  </div>
                )}
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <aside className="order-summary-box">
              <div className="checkout-section-title">ملخص الطلب</div>
              
              <div style={{ display:"grid", gap:"1rem", marginBottom:"1.5rem" }}>
                {items.map(item => (
                  <div key={item.product.id} className="summary-item" style={{ borderBottom:0, padding:0 }}>
                    <Image 
                      src={absoluteMediaUrl(item.product.image)} 
                      alt={item.product.name} 
                      width={56} height={56} 
                      style={{ width:56, height:56, objectFit:"contain", background:"var(--surface-alt)", borderRadius:"var(--radius-sm)", padding:".25rem" }}
                    />
                    <div className="summary-item-name" style={{ lineHeight:1.3 }}>
                      <strong style={{ color:"var(--navy)", display:"block", fontSize:".92rem", marginBottom:".2rem" }}>{item.product.name}</strong>
                      <span style={{ fontSize:".8rem", color:"var(--text-light)" }}>الكمية: {item.quantity}</span>
                    </div>
                    <div className="summary-item-price">
                      {money(Number(item.product.new_price ?? item.product.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <hr className="summary-divider" />
              
              <div className="summary-total">
                <span>الإجمالي الطلب</span>
                <span className="summary-total-price">{money(total)}</span>
              </div>
              
              <p style={{ fontSize:".8rem", color:"var(--text-muted)", marginTop:".5rem", display:"flex", alignItems:"center", gap:".3rem" }}>
                <span>ملاحظة</span> يتضمن ضريبة القيمة المضافة إن وجدت
              </p>

              <button 
                type="submit" 
                form="checkout-form"
                className="btn btn-primary btn-lg btn-block" 
                disabled={loading}
                style={{ marginTop:"1.5rem" }}
              >
                {loading ? "جارِ الإرسال..." : "تأكيد الطلب"}
              </button>
              
              <div style={{ textAlign:"center", marginTop:"1rem", fontSize:".8rem", color:"var(--text-muted)" }}>
                بالنقر للتأكيد، أنت توافق على شروط الاستخدام
              </div>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
