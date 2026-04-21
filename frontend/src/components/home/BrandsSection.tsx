import Image from "next/image";
import Link from "next/link";
import { absoluteMediaUrl, fallbackBrandImage } from "@/lib/media";
import type { Brand } from "@/lib/types";

export function BrandsSection({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null;

  return (
    <section className="bg-[#edf5fb] pb-12 pt-16 md:pb-14 md:pt-20">
      <div className="site-container">
        <div className="text-center">
          <span className="eyebrow mb-3">شركاؤنا</span>
          <h2 className="section-title">العلامات التجارية الموثوقة</h2>
          <p className="section-subtitle mx-auto mt-3">
            نختار العلامات التي تضمن جودة ثابتة وتعبئة جيدة وتوفرًا مناسبًا للمنازل والشركات والمنشآت.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group flex flex-col items-center gap-3 text-center"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-full border border-[#dce8f2] bg-white shadow-[0_14px_30px_rgba(10,34,56,0.06)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_rgba(10,34,56,0.09)]">
                <Image
                  src={absoluteMediaUrl(brand.logo || brand.image, fallbackBrandImage)}
                  alt={brand.name}
                  fill
                  unoptimized
                  className="object-contain p-5"
                />
              </div>
              <span className="text-sm font-black text-[#15324b]">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
