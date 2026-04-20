import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "كل المنتجات",
  description: "تصفح أفضل براندات المياه في السوق السعودي — فلترة حسب التصنيف والسعر والأكثر طلبًا."
};

type Props = {
  searchParams?: Promise<{ search?: string; category?: string; ordering?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const [products, categories] = await Promise.all([
    getProducts({ search: params.search, category: params.category, ordering: params.ordering || "-create_at" }),
    getCategories()
  ]);

  return (
    <>
      {/* Page Hero */}
      <div className="page-hero">
        <span className="eyebrow">كل المنتجات</span>
        <h1>اختر المياه المناسبة لك</h1>
        <p>فلترة وبحث سريع مع أسعار واضحة وتوفر فوري.</p>
      </div>

      <section className="page-shell">
        {/* Filters */}
        <form className="filters-bar" role="search" aria-label="فلترة المنتجات">
          <input
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="ابحث عن منتج أو براند..."
            aria-label="بحث المنتجات"
            className="form-input"
          />
          <select name="category" defaultValue={params.category ?? ""} aria-label="التصنيف" className="form-select">
            <option value="">كل التصنيفات</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select name="ordering" defaultValue={params.ordering ?? "-create_at"} aria-label="الترتيب" className="form-select">
            <option value="-create_at">الأحدث</option>
            <option value="new_price">أقل سعر</option>
            <option value="-sales_count">الأكثر طلباً</option>
          </select>
          <button type="submit" className="btn btn-primary">تطبيق</button>
        </form>

        {/* Results count */}
        {products.length > 0 && (
          <p style={{ color:"var(--text-muted)", fontSize:".88rem", marginBottom:"1.25rem" }}>
            {products.length} منتج
          </p>
        )}

        {/* Grid */}
        {products.length > 0 ? (
          <div className="product-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>لا توجد منتجات مطابقة</h3>
            <p>جرب تعديل معايير البحث أو تصفح كل المنتجات.</p>
          </div>
        )}
      </section>
    </>
  );
}
