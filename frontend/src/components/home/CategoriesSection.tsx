import Image from "next/image";
import Link from "next/link";
import { absoluteMediaUrl, fallbackProductImage } from "@/lib/media";
import type { Category } from "@/lib/types";

export function CategoriesSection({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className="site-container home-section pt-6">
      <div className="section-head">
        <div>
          <span className="eyebrow mb-3">الأقسام والعروض</span>
          <h2>تصفح العروض والأقسام</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group flex min-h-[220px] flex-col items-center rounded-[26px] border border-[#dfebf4] bg-white px-6 py-8 text-center shadow-[0_16px_38px_rgba(10,34,56,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#c6dbec] hover:shadow-[0_22px_54px_rgba(10,34,56,0.09)]"
          >
            <div className="relative mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-[#d8e7f3] bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-5">
              <Image
                src={absoluteMediaUrl(category.image, fallbackProductImage)}
                alt={category.name}
                fill
                unoptimized
                className="object-contain p-5 transition duration-500 group-hover:scale-[1.06]"
              />
            </div>

            <h3 className="text-xl font-black text-[#102231]">{category.name}</h3>
            <p className="mt-2 max-w-[22rem] text-sm leading-7 text-[#708191]">
              استكشف المنتجات المرتبطة بهذا القسم بتخطيط واضح وعرض سريع للخيارات المتاحة.
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
