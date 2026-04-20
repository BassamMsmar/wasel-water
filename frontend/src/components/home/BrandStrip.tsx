import Image from "next/image";
import Link from "next/link";
import { absoluteMediaUrl, fallbackBrandImage } from "@/lib/media";
import type { Brand, Category } from "@/lib/types";

export function BrandStrip({ brands, categories }: { brands: Brand[]; categories: Category[] }) {
  return (
    <section className="brand-category-band">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">اختيارات سريعة</span>
          <h2>تسوق حسب البراند أو النوع</h2>
        </div>
        <Link href="/brands">كل البراندات</Link>
      </div>
      <div className="brand-strip">
        {brands.slice(0, 8).map((brand) => (
          <Link href={`/brands#${brand.slug}`} key={brand.id} className="brand-pill">
            <Image src={absoluteMediaUrl(brand.logo || brand.image, fallbackBrandImage)} alt={brand.name} width={64} height={64} />
            <span>{brand.name}</span>
          </Link>
        ))}
        {categories.slice(0, 6).map((category) => (
          <Link href={`/categories/${category.slug}`} key={category.id} className="category-pill">
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
