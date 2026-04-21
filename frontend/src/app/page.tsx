import {
  getBrands,
  getCategories,
  getProducts,
} from "@/lib/api";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { BrandsSection } from "@/components/home/BrandsSection";
import { BestSellersSection } from "@/components/home/BestSellersSection";
import { AllProductsSection } from "@/components/home/AllProductsSection";

export default async function HomePage() {
  const [products, brands, categories] = await Promise.all([
    getProducts({ ordering: "-create_at" }),
    getBrands(),
    getCategories(),
  ]);

  const featuredProducts = products.slice(0, 3);
  const bestSellers = [...products]
    .sort((a, b) => Number(b.sales_count ?? 0) - Number(a.sales_count ?? 0))
    .slice(0, 5);
  const allProducts = products.slice(0, 8);
  const featuredCategories = categories.slice(0, 3);
  const featuredBrands = brands.slice(0, 7);

  return (
    <div className="min-h-screen bg-[#f7fbff]">
      <HeroSection />
      <FeaturedProducts products={featuredProducts} />
      <CategoriesSection categories={featuredCategories} />
      <BrandsSection brands={featuredBrands} />
      <BestSellersSection products={bestSellers} />
      <AllProductsSection products={allProducts} />
    </div>
  );
}
