import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>واصل للمياه</strong>
        <p>تجربة طلب واضحة، منتجات موثوقة، وتوصيل مرتب من أقرب فرع.</p>
      </div>
      <nav aria-label="روابط المتجر">
        <Link href="/products">كل المنتجات</Link>
        <Link href="/brands">العلامات التجارية</Link>
        <Link href="/cart">السلة</Link>
      </nav>
    </footer>
  );
}
