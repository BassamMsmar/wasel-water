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
      
      {/* Offers always get priority if they exist */}
      {offers.length > 0 && products.length > 0 && (
        <SectionRail title="عروض الصيف الحصرية" subtitle="لفترة محدودة" products={products.filter(p => p.discount_percent).slice(0, 8) || products.slice(0, 8)} />
      )}

      <SectionRail 
        title="الأكثر مبيعاً" 
        subtitle="طلب سريع" 
        products={bestSellers.length ? bestSellers.slice(0, 8) : products.slice(0, 8)} 
      />

      {featured.length > 0 && (
        <SectionRail title="منتجات مميزة" subtitle="مختارة من المتجر" products={featured.slice(0, 8)} />
      )}

      {products.length > 0 && (
        <SectionRail title="وصل حديثاً" subtitle="تحديثات المتجر" products={products.slice(0, 8)} />
      )}
    </>
  );
}
