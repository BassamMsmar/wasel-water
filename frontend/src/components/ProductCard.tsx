import Image from "next/image";
import Link from "next/link";
import { absoluteMediaUrl, money } from "@/lib/media";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";

function StarRow({ rating }: { rating: number | string | null | undefined }) {
  const n = Math.round(Number(rating) || 0);
  return (
    <div className="card-stars" aria-label={`تقييم ${n} من 5`}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= n ? "filled" : ""}`}>★</span>
      ))}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const price    = product.new_price ?? product.price;
  const oldPrice = product.old_price;
  const brand    = product.brand_data?.name ?? product.flag_name ?? null;

  return (
    <article className="product-card">
      {/* Image Area */}
      <Link href={`/products/${product.slug}`} className="card-image-wrap" aria-label={product.name} tabIndex={-1}>
        <Image
          src={absoluteMediaUrl(product.image)}
          alt={product.name}
          width={400}
          height={400}
          style={{ width:"100%", height:"100%", objectFit:"contain", padding:"1rem" }}
        />
        <div className="card-badges">
          {product.discount_percent ? (
            <span className="badge-discount">خصم {product.discount_percent}%</span>
          ) : null}
          {product.is_new ? <span className="badge-new">جديد</span> : null}
        </div>
      </Link>

      {/* Body */}
      <div className="card-body">
        {brand && <span className="card-brand">{brand}</span>}

        <Link href={`/products/${product.slug}`} className="card-title">
          {product.name}
        </Link>

        {product.rating ? <StarRow rating={product.rating} /> : null}

        <div className="card-price">
          <strong>{money(price)}</strong>
          {oldPrice ? <del>{money(oldPrice)}</del> : null}
        </div>

        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
