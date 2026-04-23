import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { SafeImage } from "@/components/SafeImage";
import { getProducts, getBrand } from "@/lib/api";
import { absoluteMediaUrl, fallbackBrandImage } from "@/lib/media";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "براند غير موجود" };
  return {
    title: brand.name,
    description: `تسوق جميع منتجات مياه ${brand.name}`,
  };
}

export default async function BrandDetailsPage({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrand(slug);

  if (!brand) notFound();

  const products = await getProducts({ ordering: "-create_at" });
  const brandProducts = products.filter((product) => product.brand_data?.slug === brand.slug);

  return (
    <>
      <div className="page-hero" style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }} dir="rtl">
        <div style={{ background: "#fff", padding: "1rem", borderRadius: "24px", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="relative h-full w-full overflow-hidden rounded-[20px]">
            <SafeImage
              src={absoluteMediaUrl(brand.logo || brand.image, fallbackBrandImage)}
              fallback={fallbackBrandImage}
              alt={brand.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div>
          <span className="eyebrow">منتجات مختارة</span>
          <h1 style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>{brand.name}</h1>
          <p>أفضل منتجات {brand.name} متوفرة بأسعار ممتازة وتوصيل سريع لباب بيتك.</p>
        </div>
      </div>

      <section className="page-shell" dir="rtl">
        <div className="section-head" style={{ marginBottom: "1.5rem" }}>
          <h2>المنتجات المتوفرة ({brandProducts.length})</h2>
        </div>

        {brandProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {brandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">المنتجات</div>
            <h3>لا توجد منتجات</h3>
            <p>نفدت الكمية من منتجات هذا البراند حاليًا. يرجى التحقق لاحقًا.</p>
          </div>
        )}
      </section>
    </>
  );
}
