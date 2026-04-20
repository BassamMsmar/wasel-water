import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBrands } from "@/lib/api";
import { absoluteMediaUrl, fallbackBrandImage } from "@/lib/media";

export const metadata: Metadata = {
  title: "البراندات",
  description: "كل العلامات التجارية المتاحة في متجر واصل للمياه."
};

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <section className="page-shell">
      <div className="page-heading">
        <span className="eyebrow">العلامات التجارية</span>
        <h1>براندات المياه في مكان واحد</h1>
        <p>اختيار سريع حسب البراند مع ظهور عدد المنتجات عند توفره.</p>
      </div>
      <div className="brand-grid">
        {brands.map((brand) => (
          <article key={brand.id} id={brand.slug} className="brand-card">
            <Image src={absoluteMediaUrl(brand.logo || brand.image, fallbackBrandImage)} alt={brand.name} width={220} height={160} />
            <h2>{brand.name}</h2>
            <p>{brand.products_count ?? 0} منتج</p>
            <Link href={`/products?search=${encodeURIComponent(brand.name)}`}>عرض المنتجات</Link>
          </article>
        ))}
      </div>
      {!brands.length ? <p className="empty-state">لا توجد براندات مضافة حاليا.</p> : null}
    </section>
  );
}
