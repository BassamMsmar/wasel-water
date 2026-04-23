import type { Metadata } from "next";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { getBrands } from "@/lib/api";
import { absoluteMediaUrl, fallbackBrandImage } from "@/lib/media";

export const metadata: Metadata = {
  title: "العلامات التجارية",
  description: "تصفح منتجاتنا عبر أفضل العلامات التجارية والبراندات لمياه الشرب."
};

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <>
      <div className="page-hero">
        <span className="eyebrow">شركاء النجاح</span>
        <h1>العلامات التجارية الموثوقة</h1>
        <p>نعمل مع أفضل مصانع المياه في المملكة لنضمن لك جودة ونقاوة عالية في كل قطرة.</p>
      </div>

      <section className="page-shell">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/brands/${brand.slug}`} className="brand-card" id={brand.slug}>
              <div className="brand-card-image">
                <SafeImage
                  src={absoluteMediaUrl(brand.logo || brand.image, fallbackBrandImage)}
                  fallback={fallbackBrandImage}
                  alt={brand.name}
                  width={120}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="brand-card-name">{brand.name}</div>
              {brand.products_count !== undefined && (
                <div className="brand-card-count">{brand.products_count} منتجات متاحة</div>
              )}
            </Link>
          ))}
        </div>

        {!brands.length ? (
          <div className="empty-state">
            <div className="empty-icon">🏭</div>
            <h3>لا توجد علامات تجارية</h3>
            <p>لم يتم إضافة أي براندات للمتجر حتى الآن.</p>
          </div>
        ) : null}
      </section>
    </>
  );
}
