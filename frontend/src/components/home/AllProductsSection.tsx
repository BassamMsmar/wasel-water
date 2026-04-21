import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

export function AllProductsSection({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-[1320px] px-5 py-14 sm:px-6 lg:py-16">
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-[#e4edf5] pb-4">
        <h2 className="relative pr-4 text-2xl font-black text-[#0d2133] before:absolute before:right-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-[#2d78c8]">
          جميع المنتجات
        </h2>
        <Link
          href="/products"
          className="inline-flex items-center rounded-full border border-[#d8e4f0] bg-white px-4 py-2 text-xs font-bold text-[#356ba9] transition hover:border-[#b7d0ea] hover:bg-[#f5faff]"
        >
          عرض الكل
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/products"
          className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-[#a9cbf1] bg-white px-7 py-3.5 text-sm font-extrabold text-[#2e75c4] transition hover:border-[#8ab6e5] hover:bg-[#f5faff]"
        >
          عرض المزيد من المنتجات
        </Link>
      </div>
    </section>
  );
}
