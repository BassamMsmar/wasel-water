import Image from "next/image";
import Link from "next/link";
import { absoluteMediaUrl, fallbackBrandImage } from "@/lib/media";
import type { Brand } from "@/lib/types";

export function BrandsSection({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null;

  return (
    <section className="bg-[#eef6fa] py-14 lg:py-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-[#11304a] sm:text-[2rem]">
            العلامات التجارية الموثوقة
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#708191]">
            نضمن لك الجودة عبر شراكاتنا مع أفضل العلامات العالمية والمحلية في قطاع المياه.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group flex h-[92px] items-center justify-center rounded-[18px] border border-[#dfebf3] bg-white p-4 shadow-[0_8px_24px_rgba(11,31,53,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#c3d8ea] hover:shadow-[0_14px_32px_rgba(11,31,53,0.08)]"
            >
              <div className="relative h-12 w-full">
                <Image
                  src={absoluteMediaUrl(brand.logo || brand.image, fallbackBrandImage)}
                  alt={brand.name}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
