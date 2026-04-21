import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="site-container home-section">
      <div className="section-head">
        <div>
          <span className="eyebrow mb-3">منتجات مختارة</span>
          <h2>اختيارات مميزة</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant="featured" />
        ))}
      </div>
    </section>
  );
}
