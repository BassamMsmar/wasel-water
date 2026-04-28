import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { absoluteMediaUrl, fallbackProductImage } from "@/lib/media";
import type { Category } from "@/lib/types";

export function CategoriesSection({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className="site-container relative z-10 -mb-10 pt-4 md:-mb-16">
      <div className="section-head border-b border-[#e4edf5] pb-4 text-right">
        <div>
          <span className="eyebrow mb-3">الأقسام والعروض</span>
          <h2 className="section-title">تصفح العروض والأقسام</h2>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
        {categories.map((category) => (
          <div key={category.id} className="text-center w-[150px] sm:w-[190px] md:w-[230px] max-w-[44vw]">
            <Link
              href={`/categories/${category.slug}`}
              className="group block overflow-hidden rounded-[24px] border border-[#dce8f2] bg-white shadow-[0_2px_10px_rgba(10,34,56,0.02)] transition duration-300 hover:-translate-y-0.5 hover:border-[#c4dced] hover:shadow-[0_4px_14px_rgba(10,34,56,0.03)] dark:border-[#1e344a] dark:bg-[#0b1a27] dark:shadow-none"
            >
              <div className="relative aspect-square w-full bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] dark:bg-none">
                <SafeImage
                  src={absoluteMediaUrl(category.image, fallbackProductImage)}
                  fallback={fallbackProductImage}
                  alt={category.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.06]"
                />
              </div>
            </Link>
            <h3 className="mt-3 text-sm font-black text-[#102231] dark:text-[#eef5fb]">{category.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
