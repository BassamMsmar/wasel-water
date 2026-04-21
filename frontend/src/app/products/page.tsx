import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "كل المنتجات | واصل لتوزيع المياه",
  description: "تصفح جميع منتجات المياه مع فلترة مرتبة حسب التصنيف والترتيب."
};

type Props = {
  searchParams?: Promise<{ category?: string; ordering?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const [products, categories] = await Promise.all([
    getProducts({ category: params.category, ordering: params.ordering || "-create_at" }),
    getCategories()
  ]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbfdff_0%,#f3f8fd_100%)]">
      <section className="border-b border-[#e9f1f7] bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)]">
        <div className="site-container py-14 text-center md:py-16">
          <span className="eyebrow mb-4">المنتجات</span>
          <h1 className="text-[2.2rem] font-black leading-[1.1] text-[#0b1d2d] md:text-[3.3rem]">
            اختر المياه المناسبة لك
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-8 text-[#6f8192] md:text-base">
            فلترة سريعة، عرض واضح للأسعار، وكروت مرتبة تساعدك على المقارنة والطلب بسهولة.
          </p>
        </div>
      </section>

      <section className="page-shell pt-6">
        <form
          className="mx-auto mb-8 grid gap-3 rounded-[28px] border border-[#dfeaf4] bg-white p-4 shadow-[0_14px_34px_rgba(10,34,56,0.05)] md:grid-cols-[minmax(0,1fr),minmax(0,1fr),auto]"
          role="search"
          aria-label="فلترة المنتجات"
        >
          <label className="flex items-center gap-3 rounded-[20px] border border-[#e2edf6] bg-[#f8fbff] px-4 py-3">
            <span className="text-xs font-black text-[#7c90a3]">التصنيف</span>
            <select
              name="category"
              defaultValue={params.category ?? ""}
              aria-label="التصنيف"
              className="w-full bg-transparent text-sm font-bold text-[#102231] outline-none"
            >
              <option value="">كل التصنيفات</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-[20px] border border-[#e2edf6] bg-[#f8fbff] px-4 py-3">
            <span className="text-xs font-black text-[#7c90a3]">الترتيب</span>
            <select
              name="ordering"
              defaultValue={params.ordering ?? "-create_at"}
              aria-label="الترتيب"
              className="w-full bg-transparent text-sm font-bold text-[#102231] outline-none"
            >
              <option value="-create_at">الأحدث</option>
              <option value="new_price">أقل سعر</option>
              <option value="-sales_count">الأكثر طلبًا</option>
            </select>
          </label>

          <button
            type="submit"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#123e67_0%,#2d78c8_100%)] px-8 text-sm font-black text-white shadow-[0_16px_32px_rgba(45,120,200,0.24)] transition hover:-translate-y-0.5"
          >
            تطبيق
          </button>
        </form>

        {products.length > 0 ? (
          <>
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm font-black text-[#5b7084]">
                {products.length} منتج متاح
              </p>
            </div>

            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">!</div>
            <h3>لا توجد منتجات مطابقة</h3>
            <p>جرّب تغيير الفلاتر أو العودة إلى جميع المنتجات لإظهار خيارات أخرى.</p>
          </div>
        )}
      </section>
    </div>
  );
}
