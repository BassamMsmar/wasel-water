import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { getProduct, getRelatedProducts } from "@/lib/api";
import { absoluteMediaUrl, money } from "@/lib/media";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "منتج غير موجود" };

  const description = product.description || product.subtitle || `${product.name} من متجر واصل للمياه`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: [{ url: absoluteMediaUrl(product.image) }]
    }
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.slug);
  const gallery = [product.image, ...(product.images ?? product.product_image ?? []).map((item) => item.image)].filter(Boolean);

  return (
    <section className="page-shell">
      <div className="product-detail">
        <div className="detail-gallery">
          <Image src={absoluteMediaUrl(product.image)} alt={product.name} width={720} height={720} priority />
          <div className="thumb-row">
            {gallery.slice(0, 4).map((image, index) => (
              <Image key={`${image}-${index}`} src={absoluteMediaUrl(image)} alt={`${product.name} ${index + 1}`} width={108} height={108} />
            ))}
          </div>
        </div>

        <div className="detail-info">
          <span className="eyebrow">{product.brand_data?.name || product.category_data?.name || "منتج مياه"}</span>
          <h1>{product.name}</h1>
          <p>{product.description || product.subtitle || "تفاصيل المنتج ستظهر هنا من لوحة التحكم."}</p>
          <div className="detail-price">
            <strong>{money(product.new_price ?? product.price)}</strong>
            {product.old_price ? <del>{money(product.old_price)}</del> : null}
          </div>
          <AddToCartButton product={product} />

          <dl className="spec-list">
            <div>
              <dt>التوفر</dt>
              <dd>{product.is_available === false || product.stock === 0 ? "غير متوفر" : "متوفر"}</dd>
            </div>
            <div>
              <dt>التصنيف</dt>
              <dd>{product.category_data?.name || "-"}</dd>
            </div>
            <div>
              <dt>الرمز</dt>
              <dd>{product.sku || "-"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="store-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">اقتراحات مناسبة</span>
            <h2>منتجات مشابهة</h2>
          </div>
        </div>
        <div className="product-grid">
          {related.slice(0, 4).map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </section>
  );
}
