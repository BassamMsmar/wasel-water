import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "المنتجات",
  description: "تصفح منتجات المياه حسب البحث والتصنيف والسعر."
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
    <section className="page-shell">
      <div className="page-heading">
        <span className="eyebrow">كل المنتجات</span>
        <h1>اختر المياه المناسبة لك</h1>
        <p>فلترة وبحث سريع مع بطاقات واضحة للسعر والتوفر.</p>
      </div>

      <form className="filters-bar">
        <input name="search" defaultValue={params.search ?? ""} placeholder="اسم المنتج أو البراند" aria-label="بحث المنتجات" />
        <select name="category" defaultValue={params.category ?? ""} aria-label="التصنيف">
          <option value="">كل التصنيفات</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="ordering" defaultValue={params.ordering ?? "-create_at"} aria-label="الترتيب">
          <option value="-create_at">الأحدث</option>
          <option value="new_price">الأقل سعرا</option>
          <option value="-sales_count">الأكثر طلبا</option>
        </select>
        <button type="submit">تطبيق</button>
      </form>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {!products.length ? <p className="empty-state">لا توجد منتجات مطابقة حاليا.</p> : null}
    </section>
  );
}
