import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <div className="site-container">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant="featured" />
        ))}
      </div>
    </div>
  );
}
