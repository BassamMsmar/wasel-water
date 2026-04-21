import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-[1320px] px-5 py-14 sm:px-6 lg:py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <span className="mb-2 inline-flex rounded-full bg-[#edf5ff] px-3 py-1 text-[11px] font-bold text-[#2f6fbb]">
            منتجات مختارة
          </span>
          <h2 className="text-2xl font-black text-[#091b2a] sm:text-[2rem]">
            اختيارات مميزة
          </h2>
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
