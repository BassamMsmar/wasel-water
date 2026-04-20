import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getCategoryProducts } from "@/lib/api";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: "تصنيف المنتجات",
    description: `منتجات تصنيف ${slug} في متجر واصل للمياه.`,
    alternates: { canonical: `/categories/${slug}` }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const products = await getCategoryProducts(slug);

  return (
    <section className="page-shell">
      <div className="page-heading">
        <span className="eyebrow">تصنيف</span>
        <h1>منتجات التصنيف</h1>
        <p>منتجات مرتبطة بالتصنيف المحدد من لوحة التحكم.</p>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!products.length ? <p className="empty-state">لا توجد منتجات في هذا التصنيف حاليا.</p> : null}
    </section>
  );
}
