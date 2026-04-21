import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

export function BestSellersSection({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="site-container home-section">
      <div className="section-head border-b border-[#e4edf5] pb-4">
        <div>
          <span className="eyebrow mb-3">الأكثر طلبًا</span>
          <h2>الأكثر مبيعًا</h2>
        </div>
        <Link
          href="/products?ordering=-sales_count"
          className="inline-flex items-center rounded-full border border-[#d8e4f0] bg-white px-4 py-2 text-xs font-bold text-[#356ba9] transition hover:border-[#b7d0ea] hover:bg-[#f5faff]"
        >
          عرض الكل
        </Link>
      </div>

      <div className="product-grid mt-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
