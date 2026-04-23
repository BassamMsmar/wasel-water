"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { authFetchList, getProfile, isLoggedIn } from "@/lib/auth";
import { getCompanies } from "@/lib/api";
import { cartTotal, clearCart, readCart } from "@/lib/cart";
import { buildCheckoutPayload, submitCheckout } from "@/lib/checkout";
import { getStoredLocation, syncStoredLocation } from "@/lib/location";
import { absoluteMediaUrl, fallbackProductImage, money } from "@/lib/media";
import type { Address, CartItem, Company, Customer } from "@/lib/types";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer" | "card">("cod");
  const [company, setCompany] = useState<Company | null>(null);
  const [defaults, setDefaults] = useState({
    full_name: "",
    phone: "",
    city: "",
    address: "",
    location_link: "",
    note: "",
  });

  const total = useMemo(() => cartTotal(items), [items]);
  const whatsappLink = useMemo(() => {
    const digits = (company?.whatsapp || "").replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(`مرحبًا، أود تتبع الطلب رقم ${orderId}`)}` : "";
  }, [company?.whatsapp, orderId]);

  useEffect(() => {
    setItems(readCart());
    getCompanies().then((companies) => setCompany(companies[0] ?? null)).catch(() => setCompany(null));
  }, []);

  useEffect(() => {
    const localLocation = getStoredLocation();
    if (localLocation) {
      setDefaults((current) => ({
        ...current,
        city: current.city || localLocation.city || "",
        address: current.address || localLocation.readable_address || "",
        location_link: current.location_link || localLocation.maps_url || "",
      }));
    }

    const loadDefaults = async () => {
      if (!isLoggedIn()) return;

      const [profile, customers, addresses] = await Promise.all([
        getProfile(),
        authFetchList<Customer>("/customers/"),
        authFetchList<Address>("/addresses/"),
      ]);

      const customer = customers[0];
      const address = addresses.find((item) => item.is_default) || addresses[0];
      const composedAddress = address
        ? [address.neighborhood, address.street, address.building_number, address.apartment_number].filter(Boolean).join(" - ")
        : "";

      setDefaults((current) => ({
        ...current,
        full_name: address?.full_name || `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim(),
        phone: address?.phone_number || customer?.phone_number || "",
        city: address?.city || current.city || "",
        address: composedAddress || current.address || "",
        location_link: address?.location_link || current.location_link || "",
      }));

      await syncStoredLocation().catch(() => null);
    };

    loadDefaults();
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
      window.scrollTo(0, 0);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "تعذر إرسال الطلب.");
    } finally {
      setLoading(false);
    }
  }

  if (orderId) {
    return (
      <section className="page-shell">
        <div className="order-success">
          <div className="success-icon-wrap">تم</div>
          <h2>تم استلام طلبك بنجاح</h2>
          <div className="order-number-tag">طلب رقم #{orderId}</div>
          <p>تم حفظ طلبك وسنراجع بيانات التوصيل ونتواصل معك قريبًا لتأكيد الموعد المناسب.</p>
          <div className="success-actions">
            {whatsappLink ? (
              <a href={whatsappLink} className="btn btn-whatsapp" target="_blank" rel="noreferrer">
                تتبع عبر واتساب
              </a>
            ) : null}
            <Link href="/products" className="btn btn-secondary">
              متابعة التسوق
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="page-hero" dir="rtl">
        <span className="eyebrow">إكمال الطلب</span>
        <h1>بيانات التوصيل</h1>
        <p>نملأ ما يمكن تلقائيًا من بياناتك وعنوانك المحفوظ لتكون الخطوة الأخيرة أسرع وأوضح.</p>
      </div>

      <section className="page-shell" dir="rtl">
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">السلة</div>
            <h3>السلة فارغة</h3>
            <p>لا توجد منتجات جاهزة لإتمام الشراء حاليًا.</p>
            <Link href="/products" className="btn btn-primary" style={{ marginTop: "1rem" }}>
              العودة إلى المنتجات
            </Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <div className="checkout-form-section">
              <div className="checkout-section-title">عنوان التوصيل والتواصل</div>

              {defaults.location_link ? (
                <div className="checkout-location-note">
                  <strong>تم العثور على موقع محفوظ</strong>
                  <span>يمكنك تعديل الرابط أو العنوان إذا رغبت قبل تأكيد الطلب.</span>
                </div>
              ) : null}

              <form id="checkout-form" className="form-grid" onSubmit={submit}>
                <div className="form-group">
                  <label className="form-label">الاسم الكامل</label>
                  <input name="full_name" className="form-input" autoComplete="name" required placeholder="محمد عبدالله" defaultValue={defaults.full_name} />
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
                    defaultValue={defaults.phone}
                    pattern="^(05|5)(5|0|3|6|4|9|1|8|7)[0-9]{7}$"
                    title="يجب أن يكون رقم جوال سعودي صحيح"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">المدينة</label>
                  <input name="city" className="form-input" required placeholder="جدة" defaultValue={defaults.city} />
                </div>

                <div className="form-group">
                  <label className="form-label">العنوان التفصيلي</label>
                  <textarea name="address" className="form-textarea" rows={3} required placeholder="الحي، الشارع، رقم المبنى..." defaultValue={defaults.address} />
                </div>

                <div className="form-group">
                  <label className="form-label">رابط الموقع <span className="optional">(اختياري)</span></label>
                  <input name="location_link" className="form-input" inputMode="url" placeholder="https://maps.google.com/..." defaultValue={defaults.location_link} />
                </div>

                <div className="form-group">
                  <label className="form-label">طريقة الدفع</label>
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className={`payment-method-card ${paymentMethod === "cod" ? "is-active" : ""}`}>
                      <input type="radio" name="payment_method" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                      <span>الدفع عند الاستلام</span>
                    </label>
                    <label className={`payment-method-card ${paymentMethod === "bank_transfer" ? "is-active" : ""}`}>
                      <input type="radio" name="payment_method" value="bank_transfer" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")} />
                      <span>التحويل البنكي</span>
                    </label>
                    <label className={`payment-method-card is-muted ${paymentMethod === "card" ? "is-active" : ""}`}>
                      <input type="radio" name="payment_method" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                      <span>البطاقة البنكية - قريبًا</span>
                    </label>
                  </div>
                </div>

                {paymentMethod === "bank_transfer" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">رقم التحويل</label>
                      <input name="transfer_reference" className="form-input" placeholder="TRX-12345" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">تاريخ التحويل</label>
                      <input name="transfer_date" type="date" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">المبلغ</label>
                      <input name="transfer_amount" className="form-input" placeholder="90" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">الإيصال أو الرابط</label>
                      <input name="transfer_receipt" className="form-input" placeholder="رقم الإيصال أو رابط الملف" />
                    </div>
                  </div>
                ) : null}

                <div className="form-group">
                  <label className="form-label">ملاحظات الطلب <span className="optional">(اختياري)</span></label>
                  <textarea name="note" className="form-textarea" rows={2} placeholder="أي تعليمات إضافية للمندوب" defaultValue={defaults.note} />
                </div>

                {error ? (
                  <div className="alert alert-error">
                    <span>تنبيه</span> {error}
                  </div>
                ) : null}
              </form>
            </div>

            <aside className="order-summary-box">
              <div className="checkout-section-title">ملخص الطلب</div>

              <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
                {items.map((item) => (
                  <div key={item.product.id} className="summary-item" style={{ borderBottom: 0, padding: 0 }}>
                    <SafeImage
                      src={absoluteMediaUrl(item.product.image)}
                      fallback={fallbackProductImage}
                      alt={item.product.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-[14px] bg-white object-contain p-1"
                    />
                    <div className="summary-item-name" style={{ lineHeight: 1.3 }}>
                      <strong style={{ color: "var(--navy)", display: "block", fontSize: ".92rem", marginBottom: ".2rem" }}>{item.product.name}</strong>
                      <span style={{ fontSize: ".8rem", color: "var(--text-light)" }}>الكمية: {item.quantity}</span>
                    </div>
                    <div className="summary-item-price">
                      {money(Number(item.product.new_price ?? item.product.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <hr className="summary-divider" />

              <div className="summary-total">
                <span>إجمالي الطلب</span>
                <span className="summary-total-price">{money(total)}</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="btn btn-primary btn-lg btn-block"
                disabled={loading}
                style={{ marginTop: "1.5rem" }}
              >
                {loading ? "جارٍ الإرسال..." : "تأكيد الطلب"}
              </button>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
