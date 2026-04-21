import Image from "next/image";
import Link from "next/link";
import { absoluteMediaUrl, fallbackProductImage } from "@/lib/media";
import type { Category } from "@/lib/types";

export function CategoriesSection({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className="site-container relative z-10 -mb-8 pt-4 md:-mb-12">
      <div className="mb-5 text-right">
        <span className="eyebrow mb-3">الأقسام والعروض</span>
        <h2 className="section-title">تصفح العروض والأقسام</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group flex items-center gap-4 rounded-[24px] border border-[#dce8f2] bg-white px-4 py-4 shadow-[0_16px_34px_rgba(10,34,56,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#c4dced] hover:shadow-[0_20px_44px_rgba(10,34,56,0.1)]"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[#d8e7f3] bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)]">
              <Image
                src={absoluteMediaUrl(category.image, fallbackProductImage)}
                alt={category.name}
                fill
                unoptimized
                className="object-contain p-3 transition duration-500 group-hover:scale-[1.06]"
              />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-[#102231]">{category.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-6 text-[#708191]">
                استكشف المنتجات المرتبطة بهذا القسم بشكل أسرع وأوضح.
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
