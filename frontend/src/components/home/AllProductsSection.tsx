import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

export function AllProductsSection({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="site-container home-section pt-8">
      <div className="section-head border-b border-[#e4edf5] pb-4">
        <div>
          <span className="eyebrow mb-3">كل المنتجات</span>
          <h2>جميع المنتجات</h2>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center rounded-full border border-[#d8e4f0] bg-white px-4 py-2 text-xs font-bold text-[#356ba9] transition hover:border-[#b7d0ea] hover:bg-[#f5faff] dark:border-[#2a4d70] dark:bg-[#0b1a27] dark:text-[#64a9e5] dark:hover:bg-[#0f2133]"
        >
          عرض الكل
        </Link>
      </div>

      <div className="product-grid mt-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/products"
          className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-[#a9cbf1] bg-white px-7 py-3.5 text-sm font-extrabold text-[#2e75c4] transition hover:border-[#8ab6e5] hover:bg-[#f5faff] dark:border-[#2a4d70] dark:bg-[#0b1a27] dark:text-[#64a9e5] dark:hover:bg-[#0f2133]"
        >
          عرض المزيد من المنتجات
        </Link>
      </div>
    </section>
  );
}
