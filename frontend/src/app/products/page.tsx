import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "كل المنتجات | واصل لتوزيع المياه",
  description: "تصفح أفضل براندات المياه في السوق السعودي — فلترة حسب التصنيف والسعر والأكثر طلبًا."
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
    <div className="bg-[#fafcff] min-h-screen">

      {/* Hero Section - consistent with homepage gradient */}
      <section className="bg-gradient-to-b from-[#eef6fc] to-[#fafcff] pt-14 pb-12 px-6 text-center">
        <span className="text-[0.6rem] font-bold tracking-widest text-brand-ocean bg-brand-ocean/10 px-4 py-1.5 rounded-full uppercase mb-5 inline-block">
          كل المنتجات
        </span>
        <h1 className="text-4xl md:text-[3rem] font-black text-[#002640] mb-3 leading-tight tracking-tight">
          اختر المياه المناسبة لك
        </h1>
        <p className="text-sm font-semibold text-gray-500 max-w-md mx-auto">
          فلترة سريعة مع أسعار واضحة وتوفر فوري.
        </p>
      </section>

      {/* Filters Card - floating above content */}
      <div className="mx-auto max-w-[1250px] px-6 -mt-6 relative z-10">
        <form
          className="flex flex-wrap items-center justify-center gap-3 bg-white py-4 px-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 mb-10"
          role="search"
          aria-label="فلترة المنتجات"
        >
          <div className="flex items-center gap-2 text-gray-400 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 min-w-[200px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <select
              name="category"
              defaultValue={params.category ?? ""}
              aria-label="التصنيف"
              className="bg-transparent outline-none text-sm font-bold text-gray-600 appearance-none w-full cursor-pointer"
            >
              <option value="">كل التصنيفات</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-gray-400 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 min-w-[180px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            <select
              name="ordering"
              defaultValue={params.ordering ?? "-create_at"}
              aria-label="الترتيب"
              className="bg-transparent outline-none text-sm font-bold text-gray-600 appearance-none w-full cursor-pointer"
            >
              <option value="-create_at">الأحدث</option>
              <option value="new_price">أقل سعر</option>
              <option value="-sales_count">الأكثر طلباً</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-8 py-2.5 bg-[#002640] text-white font-bold text-sm rounded-xl hover:bg-brand-ocean transition-all shadow-sm"
          >
            تطبيق
          </button>
        </form>

        {/* Results count */}
        {products.length > 0 && (
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-400 font-bold text-xs tracking-widest uppercase">
              {products.length} منتج
            </p>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-24">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm text-center mb-24">
            <div className="w-16 h-16 mb-6 bg-gray-50 rounded-full flex items-center justify-center text-2xl border border-gray-100">
              🔍
            </div>
            <h3 className="text-xl font-black text-[#002640] mb-2">لا توجد منتجات مطابقة</h3>
            <p className="text-sm text-gray-400 font-medium">جرب تعديل معايير البحث أو تصفح كل المنتجات.</p>
          </div>
        )}
      </div>

    </div>
  );
}


