import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard }     from "@/components/ProductCard";
import { getProduct, getRelatedProducts } from "@/lib/api";
import { absoluteMediaUrl, money } from "@/lib/media";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product  = await getProduct(slug);
  if (!product) return { title: "منتج غير موجود" };
  const desc = product.description || product.subtitle || `${product.name} من متجر واصل للمياه`;
  return {
    title: product.name,
    description: desc,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.name, description: desc, images: [{ url: absoluteMediaUrl(product.image) }] }
  };
}

function Stars({ rating, count }: { rating: number | string | null | undefined; count?: number | null }) {
  const n = Math.round(Number(rating) || 0);
  if (!n) return null;
  return (
    <div className="detail-stars">
      <div className="stars-row" aria-label={`${n} نجوم من 5`}>
        {[1,2,3,4,5].map(i => <span key={i} className={`star ${i<=n?"filled":""}`}>★</span>)}
      </div>
      {count ? <span className="review-count">({count} تقييم)</span> : null}
    </div>
  );
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug }   = await params;
  const product    = await getProduct(slug);
  if (!product) notFound();

  const related  = await getRelatedProducts(product.slug);
  const gallery  = [product.image, ...(product.images ?? product.product_image ?? []).map(i => i.image)].filter(Boolean);
  const price    = product.new_price ?? product.price;
  const oldPrice = product.old_price;
  const discount = product.discount_percent;
  const available = product.is_available !== false && product.stock !== 0;

  return (
    <>
      {/* Page Hero Banner */}
      <div className="page-hero">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="مسار التنقل">
          <Link href="/">الرئيسية</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/products">المنتجات</Link>
          {product.category_data && <>
            <span className="breadcrumb-sep">›</span>
            <Link href={`/categories/${product.category_data.slug}`}>{product.category_data.name}</Link>
          </>}
          <span className="breadcrumb-sep">›</span>
          <span aria-current="page">{product.name}</span>
        </nav>
      </div>

      <section className="page-shell">
        <div className="product-detail-grid">
          {/* Gallery */}
          <div>
            <div className="detail-gallery-main">
              <Image
                src={absoluteMediaUrl(product.image)}
                alt={product.name}
                width={720} height={720}
                priority
                style={{ width:"100%", height:"100%", objectFit:"contain", padding:"1.5rem" }}
              />
            </div>
            {gallery.length > 1 && (
              <div className="thumb-grid">
                {gallery.slice(0, 4).map((img, i) => (
                  <Image
                    key={`${img}-${i}`}
                    src={absoluteMediaUrl(img)}
                    alt={`${product.name} ${i+1}`}
                    width={120} height={120}
                    style={{ width:"100%", aspectRatio:"1", objectFit:"contain", background:"var(--surface-alt)", borderRadius:"var(--radius-md)", border:"1.5px solid var(--border)", padding:".4rem" }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            {product.brand_data?.name && (
              <span className="detail-brand">{product.brand_data.name}</span>
            )}
            <h1 className="detail-title">{product.name}</h1>

            <Stars rating={product.rating} count={product.reviews_count} />

            {product.description && (
              <p className="detail-description">{product.description}</p>
            )}

            {/* Price */}
            <div className="detail-price-block">
              <strong>{money(price)}</strong>
              {oldPrice && <del>{money(oldPrice)}</del>}
              {discount ? <span className="detail-discount-badge">وفّر {discount}%</span> : null}
            </div>

            {/* Availability */}
            <div>
              <span className={`availability-chip ${available ? "available" : "unavailable"}`}>
                {available ? "متوفر في المخزون" : "غير متوفر حالياً"}
              </span>
            </div>

            {/* Cart */}
            <AddToCartButton product={product} showQty />

            {/* Delivery Hint */}
            {available && (
              <div className="delivery-hint">
                <span>توصيل سريع — <strong>اطلب الآن وتوصل خلال 24 ساعة</strong></span>
              </div>
            )}

            {/* Specs */}
            <dl className="spec-grid">
              <div className="spec-row">
                <dt>الحالة</dt>
                <dd>{available ? "متوفر" : "غير متوفر"}</dd>
              </div>
              {product.category_data && (
                <div className="spec-row">
                  <dt>التصنيف</dt>
                  <dd>
                    <Link href={`/categories/${product.category_data.slug}`} style={{ color:"var(--cyan-dark)", fontWeight:700 }}>
                      {product.category_data.name}
                    </Link>
                  </dd>
                </div>
              )}
              {product.sku && (
                <div className="spec-row">
                  <dt>رمز المنتج (SKU)</dt>
                  <dd>{product.sku}</dd>
                </div>
              )}
              {product.brand_data && (
                <div className="spec-row">
                  <dt>البراند</dt>
                  <dd>
                    <Link href={`/brands/${product.brand_data.slug}`} style={{ color:"var(--cyan-dark)", fontWeight:700 }}>
                      {product.brand_data.name}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/9660000000000?text=مرحباً، أريد الاستفسار عن ${product.name}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-whatsapp"
              style={{ justifyContent:"center" }}
            >
              استفسر عبر واتساب
            </a>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section style={{ marginTop:"4rem" }}>
            <div className="section-head">
              <div>
                <span className="eyebrow">اقتراحات</span>
                <h2>منتجات مشابهة</h2>
              </div>
              <Link href="/products" style={{ color:"var(--cyan-dark)", fontWeight:700 }}>عرض الكل ←</Link>
            </div>
            <div className="product-grid">
              {related.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </section>
    </>
  );
}
