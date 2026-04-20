import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getBrand } from "@/lib/api";
import { absoluteMediaUrl, fallbackBrandImage } from "@/lib/media";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "براند غير موجود" };
  return {
    title: brand.name,
    description: `تسوق جميع منتجات مياه ${brand.name}`
  };
}

export default async function BrandDetailsPage({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrand(slug);

  if (!brand) notFound();

  // Fetch all products that belong to this brand
  const products = await getProducts({ ordering: "-create_at" });
  const brandProducts = products.filter(p => p.brand_data?.slug === brand.slug);

  return (
    <>
      <div className="page-hero" style={{ display:"flex", alignItems:"center", gap:"2rem", flexWrap:"wrap" }}>
        <div style={{ background:"#fff", padding:"1rem", borderRadius:"var(--radius-xl)", width:140, height:140, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Image
            src={absoluteMediaUrl(brand.logo || brand.image, fallbackBrandImage)}
            alt={brand.name}
            width={120} height={120}
            style={{ objectFit: "contain" }}
          />
        </div>
        <div>
          <span className="eyebrow">منتجات مختارة</span>
          <h1 style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>{brand.name}</h1>
          <p>أفضل منتجات {brand.name} متوفرة بأسعار ممتازة وتوصيل سريع لباب بيتك.</p>
        </div>
      </div>

      <section className="page-shell">
        <div className="section-head" style={{ marginBottom: "1.5rem" }}>
          <h2>المنتجات المتوفرة ({brandProducts.length})</h2>
        </div>

        {brandProducts.length > 0 ? (
          <div className="product-grid">
            {brandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>لا توجد منتجات</h3>
            <p>نفدت الكمية من منتجات هذا البراند حالياً. يرجى التحقق لاحقاً.</p>
          </div>
        )}
      </section>
    </>
  );
}
