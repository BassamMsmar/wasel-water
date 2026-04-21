import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getBrands, getCategories, getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "كل المنتجات | واصل لتوزيع المياه",
  description: "تصفح جميع منتجات المياه مع فلترة مرتبة حسب التصنيف والترتيب.",
};

type Props = {
  searchParams?: Promise<{
    category?: string;
    ordering?: string;
    search?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const [products, categories, brands] = await Promise.all([
    getProducts({
      category: params.category,
      brand: params.brand,
      ordering: params.ordering || "-create_at",
      search: params.search,
      min_price: params.min_price,
      max_price: params.max_price,
    }),
    getCategories(),
    getBrands(),
  ]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbfdff_0%,#f3f8fd_100%)]" dir="rtl">
      <section className="border-b border-[#e9f1f7] bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)]">
        <div className="site-container py-12 text-center md:py-14">
          <span className="eyebrow mb-4">المنتجات</span>
          <h1 className="text-[2.2rem] font-black leading-[1.1] text-[#0b1d2d] md:text-[3.1rem]">
            اختر المياه المناسبة لك
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-8 text-[#6f8192] md:text-base">
            صفحة منتجات أوضح: المنتجات في المساحة الأكبر، والفلاتر في عمود جانبي مستقل.
          </p>
        </div>
      </section>

      <section className="page-shell pt-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1">
            {products.length > 0 ? (
              <>
                <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#e4edf5] pb-4">
                  <p className="text-sm font-black text-[#5b7084]">{products.length} منتج متاح</p>
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
          </div>

          <aside className="xl:sticky xl:top-24 xl:w-[280px] xl:shrink-0">
            <form
              className="grid gap-3 rounded-[24px] border border-[#dfeaf4] bg-white p-4 shadow-[0_2px_12px_rgba(10,34,56,0.02)]"
              role="search"
              aria-label="فلترة المنتجات"
            >
              <div>
                <h2 className="text-lg font-black text-[#102231]">تصفية المنتجات</h2>
                <p className="mt-1 text-xs font-semibold leading-6 text-[#7c90a3]">
                  ترتيب، تصنيف، براند، ونطاق سعري.
                </p>
              </div>

              <label className="form-group">
                <span className="form-label">التصنيف</span>
                <select name="category" defaultValue={params.category ?? ""} className="form-select">
                  <option value="">كل التصنيفات</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>

              <label className="form-group">
                <span className="form-label">البراند</span>
                <select name="brand" defaultValue={params.brand ?? ""} className="form-select">
                  <option value="">كل العلامات</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </label>

              <label className="form-group">
                <span className="form-label">الترتيب</span>
                <select name="ordering" defaultValue={params.ordering ?? "-create_at"} className="form-select">
                  <option value="-create_at">الأحدث</option>
                  <option value="new_price">أقل سعر</option>
                  <option value="-sales_count">الأكثر طلبًا</option>
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <label className="form-group">
                  <span className="form-label">من سعر</span>
                  <input name="min_price" className="form-input" type="number" defaultValue={params.min_price ?? ""} placeholder="0" />
                </label>
                <label className="form-group">
                  <span className="form-label">إلى سعر</span>
                  <input name="max_price" className="form-input" type="number" defaultValue={params.max_price ?? ""} placeholder="1000" />
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex min-h-[46px] items-center justify-center rounded-[16px] border border-[#cfe0f2] bg-[#123e67] px-6 text-sm font-black text-white transition hover:bg-[#1d639f]"
              >
                تطبيق الفلاتر
              </button>
            </form>
          </aside>
        </div>
      </section>
    </div>
  );
}
