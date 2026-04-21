export function HeroSection() {
  return (
    <section className="border-b border-[#eaf1f7] bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)]">
      <div className="mx-auto flex min-h-[260px] max-w-[1320px] flex-col items-center justify-center px-5 py-14 text-center sm:min-h-[300px] sm:px-6 lg:min-h-[340px]">
        <span className="mb-5 inline-flex items-center rounded-full border border-[#cfe3ff] bg-[#ddebff] px-4 py-1.5 text-[11px] font-bold text-[#2467b2]">
          واصل . المياه الصحية
        </span>
        <h1 className="max-w-4xl text-balance text-[2.2rem] font-black leading-[1.15] text-[#091b2a] sm:text-[3rem] lg:text-[4rem]">
          واصل لتوزيع المياه
        </h1>
        <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-[#6c7c8d] sm:text-base">
          متجر متخصص في توزيع المياه بعلامات موثوقة وتجربة شراء مرتبة وسريعة للمنزل والمنشآت.
        </p>
      </div>
    </section>
  );
}
