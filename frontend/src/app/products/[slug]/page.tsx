import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Copy, MapPin, Share2, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { SafeImage } from "@/components/SafeImage";
import { getProduct, getRelatedProducts } from "@/lib/api";
import { absoluteMediaUrl, fallbackBrandImage, fallbackProductImage, money } from "@/lib/media";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "المنتج غير موجود" };

  const description =
    product.description ||
    product.subtitle ||
    `تسوق ${product.name} من متجر واصل لتوزيع المياه.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
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
  const otherBrands = Array.from(
    new Map(
      related
        .map((item) => item.brand_data)
        .filter((item): item is NonNullable<typeof item> & { slug: string } =>
          item != null && typeof item.slug === "string" && item.slug !== product.brand_data?.slug
        )
        .map((item) => [item.slug, item]),
    ).values(),
  ).slice(0, 6);

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

        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="min-w-0 flex-1 xl:max-w-[calc(100%-320px)]">
            <div className="rounded-[30px] border border-[#dfeaf4] bg-white p-5 shadow-[0_2px_12px_rgba(10,34,56,0.02)] md:p-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(320px,0.95fr),minmax(0,1fr)] lg:items-start">
                <div className="rounded-[28px] border border-[#e2ebf4] bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-4">
                  <div className="relative min-h-[360px] overflow-hidden rounded-[22px] bg-white">
                    <SafeImage
                      src={absoluteMediaUrl(product.image)}
                      fallback={fallbackProductImage}
                      alt={product.name}
                      fill
                      className="object-contain p-4"
                    />
                  </div>

                  {gallery.length > 1 ? (
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {gallery.slice(0, 4).map((image, index) => (
                        <div key={`${String(image)}-${index}`} className="relative aspect-square overflow-hidden rounded-[18px] border border-[#e4edf5] bg-[#f8fbff]">
                          <SafeImage
                            src={absoluteMediaUrl(image)}
                            fallback={fallbackProductImage}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-black text-[#1c639f]">{brand}</span>
                    <span className="rounded-full border border-[#d4e4f4] bg-white px-3 py-1 text-xs font-black text-[#1c639f]">{category}</span>
                  </div>

                  <h1 className="text-[2rem] font-black leading-[1.15] text-[#0b1d2d] md:text-[2.35rem]">
                    {product.name}
                  </h1>

                  <div className="flex items-end gap-2">
                    <strong className="text-[2rem] font-black text-[#2d78c8]">{money(price)}</strong>
                    {oldPrice ? <del className="text-sm font-bold text-[#97a7b7]">{money(oldPrice)}</del> : null}
                  </div>

                  <div className="grid gap-3 rounded-[24px] border border-[#e3edf6] bg-[#fbfdff] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-[#6b7f92]">التغليف</span>
                      <strong className="text-sm font-black text-[#102231]">{pack}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-[#6b7f92]">المقاس</span>
                      <strong className="text-sm font-black text-[#102231]">{size}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-[#6b7f92]">التوصيل</span>
                      <strong className="flex items-center gap-2 text-sm font-black text-[#102231]"><MapPin className="h-4 w-4 text-[#2d78c8]" /> سريع حسب موقعك</strong>
                    </div>
                  </div>

                  <p className="text-sm leading-8 text-[#627487]">
                    {product.subtitle || product.description || "منتج مياه موثوق بتعبئة ممتازة وعرض منظم يسهّل المقارنة والطلب السريع."}
                  </p>

                  <div className="max-w-[360px]">
                    <AddToCartButton product={product} showQty />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-[#6f8192]">
                    <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-[#2d78c8]" /> توصيل مرن</span>
                    <span className="inline-flex items-center gap-2"><Share2 className="h-4 w-4 text-[#2d78c8]" /> مشاركة المنتج</span>
                    <span className="inline-flex items-center gap-2"><Copy className="h-4 w-4 text-[#2d78c8]" /> نسخ الرابط</span>
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-6 rounded-[30px] border border-[#dfeaf4] bg-white p-6 shadow-[0_2px_12px_rgba(10,34,56,0.02)] md:p-8">
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#edf3f8] pb-4">
                <div>
                  <span className="eyebrow mb-3">الوصف</span>
                  <h2 className="text-[1.5rem] font-black text-[#102231]">تفاصيل المنتج ومميزاته</h2>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-[#e3edf6] bg-[#fbfdff] p-5">
                  <h3 className="text-base font-black text-[#102231]">الوصف الكامل</h3>
                  <p className="mt-3 text-sm leading-8 text-[#627487]">
                    {product.description || product.descriptions || product.subtitle || "تم ترتيب صفحة المنتج لتجمع الصورة والتفاصيل والشراء في كتلة واحدة واضحة، مع قسم جانبي مستقل للمنتجات والبراندات الأخرى."}
                  </p>
                </div>

                <div className="grid gap-3">
                  {[
                    "عرض واضح للسعر والتغليف والمقاس.",
                    "إضافة للسلة مباشرة مع عداد كمية سهل.",
                    "منتجات ذات صلة وعلامات أخرى في جانب مستقل.",
                    "تجربة أنظف ومتوازنة على الجوال وسطح المكتب.",
                  ].map((feature) => (
                    <div key={feature} className="rounded-[20px] border border-[#e3edf6] bg-white px-4 py-3 text-sm font-bold text-[#4f6376]">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="w-full xl:w-[300px] xl:shrink-0">
            <div className="grid gap-5">
              <section className="rounded-[28px] border border-[#dfeaf4] bg-white p-5 shadow-[0_2px_12px_rgba(10,34,56,0.02)]">
                <h2 className="mb-4 text-xl font-black text-[#102231]">منتجات ذات صلة</h2>
                <div className="grid gap-4">
                  {related.slice(0, 3).map((relatedProduct) => (
                    <ProductCard key={relatedProduct.id} product={relatedProduct} />
                  ))}
                  {!related.length ? (
                    <div className="rounded-[20px] border border-dashed border-[#d6e3ef] p-5 text-center text-sm font-bold text-[#8ca0b3]">
                      لا توجد منتجات ذات صلة حاليًا.
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-[28px] border border-[#dfeaf4] bg-white p-5 shadow-[0_2px_12px_rgba(10,34,56,0.02)]">
                <h2 className="mb-4 text-xl font-black text-[#102231]">علامات تجارية أخرى</h2>
                <div className="grid gap-3">
                  {otherBrands.map((item) => (
                    <Link key={item.id} href={`/brands/${item.slug}`} className="flex items-center gap-3 rounded-[18px] border border-[#e4edf5] bg-[#fbfdff] px-3 py-3 transition hover:border-[#c8dcec] hover:bg-white">
                      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#dfeaf4] bg-white">
                        <SafeImage
                          src={absoluteMediaUrl(item.logo || item.image, fallbackBrandImage)}
                          fallback={fallbackBrandImage}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black text-[#102231]">{item.name}</div>
                        <div className="text-xs font-bold text-[#7c90a3]">استكشف منتجات هذه العلامة</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
