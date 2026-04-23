import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "../ProductCard";

export function SectionRail({
  title, subtitle, products, href = "/products"
}: {
  title: string; subtitle: string; products: Product[]; href?: string;
}) {
  if (!products.length) return null;

  return (
    <section style={{ background:"var(--bg)", paddingBlock:"var(--section-py)" }}>
      <div className="section-wrap" style={{ paddingBlock:0 }}>
        <div className="section-head">
          <div>
            <span className="eyebrow">{subtitle}</span>
            <h2>{title}</h2>
          </div>
          <Link href={href}>عرض الكل ←</Link>
        </div>
        <div className="product-grid">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
