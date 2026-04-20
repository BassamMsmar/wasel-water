import Image from "next/image";
import Link from "next/link";
import { absoluteMediaUrl, money } from "@/lib/media";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  const price = product.new_price ?? product.price;
  const oldPrice = product.old_price;

  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-image-link" aria-label={product.name}>
        <Image src={absoluteMediaUrl(product.image)} alt={product.name} width={420} height={420} className="product-image" />
        {product.discount_percent ? <span className="badge discount">خصم {product.discount_percent}%</span> : null}
        {product.is_new ? <span className="badge new">جديد</span> : null}
      </Link>

      <div className="product-body">
        <Link href={`/products/${product.slug}`} className="product-title">
          {product.name}
        </Link>
        <p>{product.subtitle || product.brand_data?.name || "مياه مختارة بعناية"}</p>
        <div className="price-row">
          <strong>{money(price)}</strong>
          {oldPrice ? <del>{money(oldPrice)}</del> : null}
        </div>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
