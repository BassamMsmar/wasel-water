import { BrandStrip } from "@/components/home/BrandStrip";
import { HeroProducts } from "@/components/home/HeroProducts";
import { SectionRail } from "@/components/home/SectionRail";
import { TrustBar } from "@/components/home/TrustBar";
import { getBestSellers, getBrands, getCategories, getFeaturedProducts, getOffers, getProducts } from "@/lib/api";

export default async function HomePage() {
  const [featured, bestSellers, products, brands, categories, offers] = await Promise.all([
    getFeaturedProducts(),
    getBestSellers(),
    getProducts({ ordering: "-create_at" }),
    getBrands(),
    getCategories(),
    getOffers()
  ]);

  const heroProducts = featured.length ? featured : products;

  return (
    <>
      <HeroProducts products={heroProducts} />
      <TrustBar />
      <BrandStrip brands={brands} categories={categories} />
      <SectionRail title="الأكثر مبيعا" subtitle="طلب سريع" products={bestSellers.length ? bestSellers.slice(0, 8) : products.slice(0, 8)} />
      <SectionRail title="منتجات مميزة" subtitle="مختارة من المتجر" products={featured.slice(0, 8)} />
      <SectionRail title="وصل حديثا" subtitle={offers.length ? "عروض ومنتجات جديدة" : "تحديثات المتجر"} products={products.slice(0, 8)} />
    </>
  );
}
