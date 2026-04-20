import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { getCategory, getProducts } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "التصنيف غير موجود" };
  return {
    title: category.name,
    description: `تصفح المنتجات في قسم ${category.name}`
  };
}

export default async function CategoryDetailsPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  // Fetch all products that belong to this category
  const products = await getProducts({ category: category.id.toString(), ordering: "-create_at" });

  return (
    <>
      <div className="page-hero">
        <span className="eyebrow">التصنيفات</span>
        <h1>{category.name}</h1>
        <p>تصفح أفضل المنتجات ضمن قائمة {category.name} بأسعار مميزة.</p>
      </div>

      <section className="page-shell">
        <div className="section-head" style={{ marginBottom: "1.5rem" }}>
          <h2>المنتجات المتوفرة ({products.length})</h2>
        </div>

        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🗂️</div>
            <h3>لا توجد منتجات</h3>
            <p>هذا التصنيف فارغ حالياً. يرجى التحقق لاحقاً أو تصفح الأقسام الأخرى.</p>
          </div>
        )}
      </section>
    </>
  );
}
