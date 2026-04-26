import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { absoluteMediaUrl, fallbackBrandImage } from "@/lib/media";
import type { Brand } from "@/lib/types";

export function BrandsSection({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null;

  return (
    <section className="bg-[#edf5fb] pb-12 pt-16 md:pb-14 md:pt-20">
      <div className="site-container">
        <div className="section-head border-b border-[#d4e2ee] pb-4 text-right">
          <div>
            <span className="eyebrow mb-3">شركاؤنا</span>
            <h2 className="section-title">العلامات التجارية الموثوقة</h2>
            <p className="section-subtitle mt-3">
              نختار العلامات التي تضمن جودة ثابتة وتعبئة جيدة وتوفرًا مناسبًا للمنازل والشركات والمنشآت.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-5 lg:gap-7">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group flex flex-col items-center gap-3 text-center w-[100px] sm:w-[120px] lg:w-[140px]"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-full border border-[#dce8f2] bg-white shadow-[0_2px_10px_rgba(10,34,56,0.02)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_4px_14px_rgba(10,34,56,0.03)]">
                <SafeImage
                  src={absoluteMediaUrl(brand.logo || brand.image, fallbackBrandImage)}
                  fallback={fallbackBrandImage}
                  alt={brand.name}
                  fill
                  className="object-cover"
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
