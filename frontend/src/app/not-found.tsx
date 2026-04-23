import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-shell not-found">
      <span className="eyebrow">غير موجود</span>
      <h1>الصفحة غير متاحة</h1>
      <p>قد يكون الرابط تغير أو المنتج غير متاح حاليا.</p>
      <Link href="/products">العودة للمنتجات</Link>
    </section>
  );
}
