import Image from "next/image";
import Link from "next/link";
import { absoluteMediaUrl, money } from "@/lib/media";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const price    = product.new_price ?? product.price;
  const brand    = product.brand_data?.name ?? product.category_data?.name ?? "العلامة التجارية";
  
  // Dummy data for visual representation to match reference structure
  const volume = "330 مل";
  const pieces = "40 قارورة";

  return (
    <article className="group flex flex-col rounded-[1.5rem] bg-white p-3 md:p-4 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-brand-ocean/20 h-full">
      
      {/* Image Area */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[5/4] w-full overflow-hidden rounded-xl border border-gray-50 flex items-center justify-center p-4 bg-white mb-4 group-hover:bg-gray-50/50 transition-colors">
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-1 z-10">
           <span className="bg-brand-ocean text-white text-[0.55rem] font-bold px-2 py-1 rounded border border-brand-ocean/10">{volume}</span>
           <span className="bg-white text-brand-ocean text-[0.55rem] font-bold px-2 py-1 rounded border border-brand-ocean/20">{pieces}</span>
        </div>

        <Image
          src={absoluteMediaUrl(product.image)}
          alt={product.name}
          fill
          unoptimized
          className="object-contain transition-transform duration-500 group-hover:scale-105 p-6"
        />
      </Link>

      {/* Body Area */}
      <div className="flex flex-col flex-1 px-1">
        
        <div className="flex justify-between items-start mb-2">
            <span className="text-[0.6rem] font-bold text-gray-400">
               {brand}
            </span>
        </div>
        
        <Link href={`/products/${product.slug}`} className="text-sm font-black text-[#002640] mb-3 hover:text-brand-ocean line-clamp-2 leading-relaxed transition-colors">
          {product.name}
        </Link>

        {/* Bottom row: Price & Cart Actions */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          
          {/* Price (RTL Right) */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-brand-ocean">{Number(price).toFixed(2)}</span>
              <span className="text-[0.6rem] font-bold text-brand-ocean">ر.س</span>
            </div>
            <span className="text-[0.55rem] font-bold text-gray-400">شامل الضريبة</span>
          </div>

          {/* Actions (RTL Left) */}
          <div className="flex items-center gap-2">
             
             {/* Quantity Selector - purely visual for now */}
             <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-sm">
                <button className="text-gray-400 hover:text-[#002640] hover:bg-gray-50 rounded-full w-4 h-4 flex items-center justify-center transition-colors">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                </button>
                <span className="text-xs font-bold text-[#002640] min-w-[12px] text-center">1</span>
                <button className="text-gray-400 hover:text-[#002640] hover:bg-gray-50 rounded-full w-4 h-4 flex items-center justify-center transition-colors">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </button>
             </div>

             {/* Add to Cart Button */}
             <button aria-label="أضف للسلة" className="w-8 h-8 rounded-full bg-[#002640] text-white flex items-center justify-center hover:bg-brand-ocean transition-all shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/><path d="M9 11h6"/><path d="M12 8v6"/></svg>
             </button>
          </div>
          
        </div>
      </div>
    </article>
  );
}
