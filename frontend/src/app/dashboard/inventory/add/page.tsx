import { CirclePlus, ImagePlus, Package2, Tags } from "lucide-react";

export default function AddProductPage() {
  return (
    <section className="rounded-[30px] border border-[#dfeaf4] bg-white p-6 shadow-[0_18px_42px_rgba(10,34,56,0.06)] md:p-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-[#edf3f8] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow mb-3">إدارة المنتجات</span>
          <h1 className="text-[2rem] font-black text-[#102231]">إضافة منتج جديد</h1>
          <p className="mt-3 max-w-2xl text-sm leading-8 text-[#6b7f92]">
            نموذج مرتب لإدخال أهم بيانات المنتج بشكل واضح قبل ربطه لاحقًا بواجهات الإدارة أو الحفظ الفعلي.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="btn btn-secondary">حفظ كمسودة</button>
          <button className="btn btn-primary">نشر المنتج</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr),360px]">
        <div className="grid gap-6">
          <div className="rounded-[26px] border border-[#e3edf6] bg-[#fbfdff] p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ddebff] text-[#2d78c8]">
                <Package2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#102231]">البيانات الأساسية</h2>
                <p className="text-sm text-[#7b8ea2]">اسم المنتج، القسم، والوصف المختصر.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-group md:col-span-2">
                <span className="form-label">اسم المنتج الظاهر</span>
                <input type="text" className="form-input" placeholder="مثال: كرتون مياه 330 مل × 40" />
              </label>
              <label className="form-group">
                <span className="form-label">القسم</span>
                <select className="form-select" defaultValue="">
                  <option value="" disabled>اختر القسم</option>
                  <option>منازل</option>
                  <option>شركات</option>
                  <option>مساجد</option>
                </select>
              </label>
              <label className="form-group">
                <span className="form-label">العلامة التجارية</span>
                <select className="form-select" defaultValue="">
                  <option value="" disabled>اختر العلامة</option>
                  <option>بيرين</option>
                  <option>نوفا</option>
                  <option>روا</option>
                </select>
              </label>
              <label className="form-group md:col-span-2">
                <span className="form-label">وصف المنتج</span>
                <textarea className="form-textarea" rows={4} placeholder="اكتب وصفًا موجزًا يوضح العبوة والاستخدام والتوفر..." />
              </label>
            </div>
          </div>

          <div className="rounded-[26px] border border-[#e3edf6] bg-[#fbfdff] p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ddebff] text-[#2d78c8]">
                <Tags className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#102231]">التسعير والمخزون</h2>
                <p className="text-sm text-[#7b8ea2]">ضبط السعر، الكمية، والحالة.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="form-group">
                <span className="form-label">السعر</span>
                <input type="text" className="form-input" placeholder="0.00" />
              </label>
              <label className="form-group">
                <span className="form-label">الكمية</span>
                <input type="number" className="form-input" placeholder="100" />
              </label>
              <label className="form-group">
                <span className="form-label">الحالة</span>
                <select className="form-select" defaultValue="متوفر">
                  <option>متوفر</option>
                  <option>قريبًا</option>
                  <option>غير متوفر</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[26px] border border-[#e3edf6] bg-[#fbfdff] p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ddebff] text-[#2d78c8]">
                <ImagePlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#102231]">صورة المنتج</h2>
                <p className="text-sm text-[#7b8ea2]">منطقة عرض مبدئية للصورة الرئيسية.</p>
              </div>
            </div>

            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#c7d9ea] bg-white p-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef6ff] text-[#2d78c8]">
                <CirclePlus className="h-6 w-6" />
              </div>
              <strong className="text-base font-black text-[#102231]">اسحب الصورة هنا أو اخترها يدويًا</strong>
              <p className="mt-2 text-sm leading-7 text-[#7b8ea2]">
                يفضل استخدام صورة واضحة بخلفية نظيفة حتى تظهر داخل الكرت بشكل جيد.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
