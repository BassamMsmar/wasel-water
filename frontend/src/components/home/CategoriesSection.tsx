import Image from "next/image";
import Link from "next/link";
import { absoluteMediaUrl, fallbackProductImage } from "@/lib/media";
import type { Category } from "@/lib/types";

export function CategoriesSection({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className="mx-auto max-w-[1320px] px-5 py-10 sm:px-6 lg:py-14">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-black text-[#091b2a] sm:text-[2rem]">
          تصفح العروض والأقسام
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group overflow-hidden rounded-[22px] border border-[#e6eef7] bg-white shadow-[0_14px_40px_rgba(11,31,53,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#cfe0f4] hover:shadow-[0_18px_48px_rgba(11,31,53,0.08)]"
          >
            <div className="relative h-[260px] overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#eaf3fb_100%)] p-6">
              <Image
                src={absoluteMediaUrl(category.image, fallbackProductImage)}
                alt={category.name}
                fill
                unoptimized
                className="object-contain p-6 transition duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="border-t border-[#eef3f8] px-5 py-4 text-center">
              <h3 className="text-lg font-extrabold text-[#102231]">{category.name}</h3>
              <p className="mt-1 text-sm text-[#6f8192]">استكشف الأصناف المرتبطة بهذا القسم</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
