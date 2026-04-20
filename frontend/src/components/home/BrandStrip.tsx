import Image from "next/image";
import Link from "next/link";
import { absoluteMediaUrl, fallbackBrandImage } from "@/lib/media";
import type { Brand, Category } from "@/lib/types";

export function BrandStrip({ brands, categories }: { brands: Brand[]; categories: Category[] }) {
  if (!brands.length && !categories.length) return null;
  return (
    <section className="brand-strip-section">
      <div className="section-wrap" style={{ paddingBlock:"2rem" }}>
        <div className="section-head">
          <div>
            <span className="eyebrow">اختيارات سريعة</span>
            <h2>تسوق حسب البراند أو النوع</h2>
          </div>
          <Link href="/brands">كل البراندات ←</Link>
        </div>
        <div className="brand-scroll">
          {brands.slice(0, 10).map(b => (
            <Link href={`/brands/${b.slug}`} key={b.id} className="brand-pill">
              <Image
                src={absoluteMediaUrl(b.logo || b.image, fallbackBrandImage)}
                alt={b.name}
                width={32}
                height={32}
                style={{ borderRadius:"50%", objectFit:"contain" }}
              />
              {b.name}
            </Link>
          ))}
          {categories.slice(0, 8).map(c => (
            <Link href={`/categories/${c.slug}`} key={c.id} className="cat-pill">
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
