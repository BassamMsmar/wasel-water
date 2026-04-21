import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProduct, getRelatedProducts } from "@/lib/api";
import { absoluteMediaUrl, money } from "@/lib/media";
import Link from "next/link";
import { Droplet, Leaf, Shield, Truck, ChevronDown, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product  = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  const desc = product.description || product.subtitle || `${product.name} from Wasel Water`;
  return {
    title: product.name,
    description: desc,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.name, description: desc, images: [{ url: absoluteMediaUrl(product.image) }] }
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug }   = await params;
  const product    = await getProduct(slug);
  if (!product) notFound();

  const related  = await getRelatedProducts(product.slug);
  const gallery  = [product.image, ...(product.images ?? product.product_image ?? []).map((i: any) => i.image)].filter(Boolean);
  const price    = product.new_price ?? product.price;

  return (
    <div className="bg-brand-ice/20 min-h-screen py-12">
      <div className="mx-auto max-w-[1400px] px-6">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-8 uppercase tracking-widest">
          <Link href="/" className="hover:text-brand-dark transition-colors">Home</Link>
          <span>›</span>
          <Link href="/products" className="hover:text-brand-dark transition-colors">Catalog</Link>
          <span>›</span>
          <span className="text-brand-dark">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 mb-20">
          
          {/* Left Gallery */}
          <div className="flex flex-col gap-4">
            <div className="aspect-[4/5] relative rounded-3xl bg-brand-ice/50 border border-brand-ice overflow-hidden flex items-center justify-center p-8">
              <Image
                src={absoluteMediaUrl(product.image)}
                alt={product.name}
                fill
                priority
                unoptimized
                className="object-contain"
              />
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {gallery.slice(0, 3).map((img, i) => (
                  <div key={i} className="aspect-square relative rounded-xl bg-gray-100 overflow-hidden border border-gray-200 cursor-pointer hover:border-brand-ocean transition-all">
                    <Image src={absoluteMediaUrl(img)} alt={`Thumb ${i}`} fill unoptimized className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Info */}
          <div className="flex flex-col py-6">
            <span className="inline-flex items-center self-start text-[0.65rem] font-bold tracking-widest text-brand-dark uppercase bg-brand-ice px-3 py-1.5 rounded-sm mb-4">
              Official Reserve
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-brand-dark leading-tight tracking-tight mb-6">
              {product.name}
            </h1>
            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8 max-w-lg">
              Sourced from the heart of the untouched northern glaciers, our flagship water undergoes a natural 20-year filtration process through volcanic rock layers, resulting in unparalleled purity and a crisp, mineral-rich profile.
            </p>

            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm mb-10">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Standard Unit</span>
                  <div className="text-3xl font-black text-brand-dark">{money(price)}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-dark block">In Stock</span>
                  <span className="text-[0.65rem] font-medium text-gray-400">Available for Next-Day Delivery</span>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Choose Package Size</span>
                <div className="grid grid-cols-3 gap-3">
                  <button className="border-2 border-brand-dark text-brand-dark rounded-md py-2.5 text-xs font-bold hover:bg-gray-50 transition">12 x 750ml</button>
                  <button className="border border-gray-200 text-gray-500 rounded-md py-2.5 text-xs font-bold hover:text-brand-dark transition">24 x 500ml</button>
                  <button className="border border-gray-200 text-gray-500 rounded-md py-2.5 text-xs font-bold hover:text-brand-dark transition">Bulk (5G)</button>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-brand-dark text-white rounded-md py-4 font-bold hover:bg-brand transition-colors">
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
            </div>

            {/* Accordions */}
            <div className="flex flex-col gap-2">
              <div className="border border-gray-200 bg-white rounded-lg p-5 flex justify-between items-center cursor-pointer hover:border-brand-ice">
                <span className="text-sm font-bold text-brand-dark">Mineral Composition</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <div className="border border-gray-200 bg-white rounded-lg p-5 flex justify-between items-center cursor-pointer hover:border-brand-ice">
                <span className="text-sm font-bold text-brand-dark">Sustainability & Source</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>

          </div>
        </div>

        {/* The Purity Promise */}
        <div className="mb-20">
          <h2 className="text-2xl font-black text-brand-dark tracking-tight mb-6">The Purity Promise</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-3xl bg-brand-dark text-white p-10 flex flex-col justify-end min-h-[300px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark to-brand-ocean/30 opacity-50 z-0"></div>
              <div className="relative z-10">
                <Droplet className="w-8 h-8 text-white mb-6" />
                <h3 className="text-2xl font-bold mb-3">Zero-Impact Extraction</h3>
                <p className="text-sm text-white/80 font-medium max-w-md">Our extraction method mimics the natural overflow of the aquifer, ensuring that the water table remains untouched and the local ecosystem thrives without human interference.</p>
              </div>
            </div>
            
            <div className="rounded-3xl bg-gray-200/60 p-10 flex flex-col justify-center">
              <Leaf className="w-6 h-6 text-brand-dark mb-4" />
              <h4 className="text-lg font-bold text-brand-dark mb-2">Circular Design</h4>
              <p className="text-xs text-gray-500 font-medium">100% recycled PET or artisanal glass options designed for life-long reuse or infinite recyclability.</p>
            </div>

            <div className="rounded-3xl bg-white border border-gray-200 p-10 flex flex-col justify-center shadow-sm">
              <Shield className="w-6 h-6 text-brand-dark mb-4" />
              <h4 className="text-lg font-bold text-brand-dark mb-2">Certified Quality</h4>
              <p className="text-xs text-gray-500 font-medium">Exceeding international standards for mineral consistency and microbial safety through rigorous daily testing.</p>
            </div>

            <div className="md:col-span-2 rounded-3xl bg-brand-ice/80 p-10 flex flex-col justify-center border border-brand-ice">
              <h4 className="text-lg font-bold text-brand-dark mb-2">Delivery Network</h4>
              <p className="text-sm text-brand-dark/70 font-medium max-w-lg">Direct-to-enterprise logistics network ensuring that every shipment arrives at the perfect cellar temperature.</p>
            </div>
          </div>
        </div>

        {/* Related Collections */}
        {related && related.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-brand-dark tracking-tight">Related Collections</h2>
                <p className="text-xs text-gray-500 mt-2 font-medium">Curated selections for the discerning palate.</p>
              </div>
              <Link href="/products" className="text-xs font-bold text-brand-dark hover:text-brand-ocean flex items-center gap-1">
                View Catalog <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
