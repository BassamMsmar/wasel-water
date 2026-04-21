import Image from "next/image";
import Link from "next/link";
import { absoluteMediaUrl, fallbackBrandImage } from "@/lib/media";
import type { Brand } from "@/lib/types";

export function BrandsSection({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null;

  return (
    <section className="bg-[#edf5fb] py-14 lg:py-16">
      <div className="site-container">
        <div className="text-center">
          <span className="eyebrow mb-3">شركاؤنا</span>
          <h2 className="section-title">العلامات التجارية الموثوقة</h2>
          <p className="section-subtitle mx-auto mt-3">
            نختار العلامات التي تضمن جودة ثابتة، تعبئة جيدة، وتوفراً مناسباً للمنازل والشركات والمنشآت.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group flex flex-col items-center justify-center gap-3 rounded-[24px] border border-[#dce8f2] bg-white p-4 text-center shadow-[0_12px_28px_rgba(10,34,56,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#c5dced] hover:shadow-[0_18px_40px_rgba(10,34,56,0.09)]"
            >
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#dce8f2] bg-[linear-gradient(180deg,#ffffff_0%,#f3f8fe_100%)] p-4">
                <Image
                  src={absoluteMediaUrl(brand.logo || brand.image, fallbackBrandImage)}
                  alt={brand.name}
                  fill
                  unoptimized
                  className="object-contain p-4"
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
