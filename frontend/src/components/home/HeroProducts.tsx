import Image from "next/image";
import Link from "next/link";
import { absoluteMediaUrl, money } from "@/lib/media";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "../AddToCartButton";

export function HeroProducts({ products }: { products: Product[] }) {
  const hero = products[0];
  const secondary = products.slice(1, 4);

  if (!hero) {
    return (
      <section className="hero-empty">
        <div>
          <span className="eyebrow">واصل للمياه</span>
          <h1>متجر سريع وواضح لطلب المياه من أقرب فرع</h1>
          <p>الواجهة جاهزة للربط مع بيانات المنتجات والبراندات والتصنيفات من لوحة التحكم.</p>
          <Link href="/products" className="hero-link">تصفح المنتجات</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-products">
      <div className="hero-copy">
        <span className="eyebrow">الأكثر طلبا اليوم</span>
        <h1>{hero.name}</h1>
        <p>{hero.description || hero.subtitle || "اختيار مناسب للمنزل والمكتب مع توصيل مرتب وسريع."}</p>
        <div className="hero-actions">
          <strong>{money(hero.new_price ?? hero.price)}</strong>
          <AddToCartButton product={hero} />
          <Link href={`/products/${hero.slug}`} className="secondary-link">التفاصيل</Link>
        </div>
      </div>
      <div className="hero-visual">
        <Image src={absoluteMediaUrl(hero.image)} alt={hero.name} width={620} height={620} priority />
      </div>
      <div className="hero-side-list" aria-label="منتجات مقترحة">
        {secondary.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="mini-product">
            <Image src={absoluteMediaUrl(product.image)} alt={product.name} width={96} height={96} />
            <span>{product.name}</span>
            <strong>{money(product.new_price ?? product.price)}</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
