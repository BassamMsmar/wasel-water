import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Droplet, Leaf, ShieldCheck, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { getProduct, getRelatedProducts } from "@/lib/api";
import { absoluteMediaUrl, money } from "@/lib/media";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "المنتج غير موجود" };
  }

  const description =
    product.description ||
    product.subtitle ||
    `تسوّق ${product.name} من متجر واصل لتوزيع المياه.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: [{ url: absoluteMediaUrl(product.image) }],
    },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.slug);
  const gallery = [product.image, ...(product.images ?? product.product_image ?? []).map((image) => image.image)].filter(Boolean);
  const price = product.new_price ?? product.price;
  const oldPrice =
    product.old_price && Number(product.old_price) > Number(price ?? 0)
      ? product.old_price
      : null;
  const brand = product.brand_data?.name ?? "واصل";
  const category = product.category_data?.[0]?.name ?? "منتجات المياه";
  const size = product.tags?.[0] ?? "330 مل";
  const pack = product.tags?.[1] ?? "40 عبوة";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbfdff_0%,#f3f8fd_100%)]" dir="rtl">
      <section className="page-shell pt-6">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-bold text-[#7a8ea2]">
          <Link href="/" className="transition hover:text-[#102231]">الرئيسية</Link>
          <ChevronLeft className="h-4 w-4" />
          <Link href="/products" className="transition hover:text-[#102231]">المنتجات</Link>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-[#102231]">{product.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(360px,0.95fr),minmax(0,1.05fr)]">
          <div className="rounded-[28px] border border-[#dfeaf4] bg-white p-6 shadow-[0_2px_12px_rgba(10,34,56,0.02)] md:p-8">
            <span className="eyebrow mb-4">تفاصيل المنتج</span>
            <h1 className="text-[2rem] font-black leading-[1.2] text-[#0b1d2d] md:text-[2.8rem]">
              {product.name}
            </h1>
            <p className="mt-4 text-base leading-8 text-[#627487]">
              {product.subtitle || product.description || "منتج مياه موثوق بجودة تعبئة ممتازة وتوفر مناسب للطلب السريع."}
            </p>

            <div className="mt-6 flex items-end justify-between gap-3 rounded-[22px] border border-[#e3edf6] bg-[#f8fbff] p-4">
              <div>
                <div className="text-xs font-black text-[#7d90a2]">السعر الحالي</div>
                <strong className="mt-2 block text-2xl font-black text-[#2d78c8]">
                  {money(price)}
                </strong>
              </div>
              {oldPrice ? (
                <div className="text-left">
                  <div className="text-xs font-black text-[#7d90a2]">السعر القديم</div>
                  <del className="mt-2 block text-sm font-bold text-[#97a7b7]">
                    {money(oldPrice)}
                  </del>
                </div>
              ) : null}
            </div>

            <div className="mt-6 grid gap-3 rounded-[24px] border border-[#e3edf6] bg-[#fbfdff] p-4">
              <div className="flex items-center justify-between gap-3 border-b border-[#edf3f8] pb-3">
                <span className="text-sm font-bold text-[#6b7f92]">العلامة التجارية</span>
                <strong className="text-sm font-black text-[#102231]">{brand}</strong>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-[#edf3f8] pb-3">
                <span className="text-sm font-bold text-[#6b7f92]">القسم</span>
                <strong className="text-sm font-black text-[#102231]">{category}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-[#6b7f92]">المقاس والتعبئة</span>
                <strong className="text-sm font-black text-[#102231]">{size} - {pack}</strong>
              </div>
            </div>

            <div className="mt-6">
              <AddToCartButton product={product} showQty />
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[#dfeaf4] bg-white shadow-[0_2px_12px_rgba(10,34,56,0.02)]">
            <div className="relative min-h-[460px] bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)]">
              <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-center justify-between gap-3 p-5">
                <span className="rounded-full border border-[#d4e4f4] bg-white/92 px-3 py-1 text-xs font-black text-[#1c639f]">
                  {brand}
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#2d78c8] px-3 py-1 text-[11px] font-black text-white">
                    {size}
                  </span>
                  <span className="rounded-full border border-[#d4e4f4] bg-white/92 px-3 py-1 text-[11px] font-black text-[#1c639f]">
                    {pack}
                  </span>
                </div>
              </div>

              <Image
                src={absoluteMediaUrl(product.image)}
                alt={product.name}
                fill
                priority
                unoptimized
                className="object-contain p-2 pt-16"
              />
            </div>

            {gallery.length > 1 ? (
              <div className="grid grid-cols-3 gap-3 border-t border-[#edf3f8] p-4 md:grid-cols-4">
                {gallery.slice(0, 4).map((image, index) => (
                  <div
                    key={`${String(image)}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-[18px] border border-[#e4edf5] bg-[#f8fbff]"
                  >
                    <Image
                      src={absoluteMediaUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      unoptimized
                      className="object-contain p-2"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <section className="mt-8 rounded-[28px] border border-[#dfeaf4] bg-white p-6 shadow-[0_2px_12px_rgba(10,34,56,0.02)] md:p-8">
          <div className="section-head mb-6">
            <div>
              <span className="eyebrow mb-3">تفاصيل أكثر</span>
              <h2>وصف ومميزات المنتج</h2>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] border border-[#e3edf6] bg-[#fbfdff] p-4">
              <h3 className="text-base font-black text-[#102231]">الوصف الكامل</h3>
              <p className="mt-3 text-sm leading-8 text-[#627487]">
                {product.description || product.descriptions || product.subtitle || "تم ترتيب صفحة المنتج لتعرض المعلومة بشكل أوضح: صورة، معلومات، تفاصيل، ثم منتجات ذات صلة."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-[#e3edf6] bg-white p-4">
                <Droplet className="mb-3 h-5 w-5 text-[#2d78c8]" />
                <h3 className="text-base font-black text-[#102231]">نقاء موثوق</h3>
                <p className="mt-2 text-sm leading-7 text-[#6b7f92]">
                  عرض واضح للحجم والتعبئة والسعر بدون ازدحام بصري.
                </p>
              </div>
              <div className="rounded-[22px] border border-[#e3edf6] bg-white p-4">
                <Truck className="mb-3 h-5 w-5 text-[#2d78c8]" />
                <h3 className="text-base font-black text-[#102231]">توصيل أسرع</h3>
                <p className="mt-2 text-sm leading-7 text-[#6b7f92]">
                  تجربة شراء أبسط من عرض المنتج حتى إكمال الطلب.
                </p>
              </div>
              <div className="rounded-[22px] border border-[#e3edf6] bg-white p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-[#2d78c8]" />
                <h3 className="text-base font-black text-[#102231]">عرض منظم</h3>
                <p className="mt-2 text-sm leading-7 text-[#6b7f92]">
                  تفصيل المنتج في قسم منفصل أسفل المعلومات الأساسية.
                </p>
              </div>
              <div className="rounded-[22px] border border-[#e3edf6] bg-white p-4">
                <Leaf className="mb-3 h-5 w-5 text-[#2d78c8]" />
                <h3 className="text-base font-black text-[#102231]">منتجات ذات صلة</h3>
                <p className="mt-2 text-sm leading-7 text-[#6b7f92]">
                  اقتراحات جاهزة أسفل الصفحة بنفس بنية الكروت الجديدة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 ? (
          <section className="mt-12">
            <div className="section-head border-b border-[#e4edf5] pb-4">
              <div>
                <span className="eyebrow mb-3">اقتراحات إضافية</span>
                <h2>منتجات ذات صلة</h2>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center rounded-full border border-[#d8e4f0] bg-white px-4 py-2 text-xs font-bold text-[#356ba9] transition hover:border-[#b7d0ea] hover:bg-[#f5faff]"
              >
                عرض المزيد
              </Link>
            </div>

            <div className="product-grid mt-6">
              {related.slice(0, 4).map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </div>
  );
}
