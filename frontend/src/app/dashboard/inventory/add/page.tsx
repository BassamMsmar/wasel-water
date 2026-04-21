"use client";

import { UploadCloud, Info } from "lucide-react";

export default function AddProductPage() {
  return (
    <div className="p-8 pb-20 max-w-[1200px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            INVENTORY <span className="text-gray-300">›</span> <span className="text-brand-ocean">ADD NEW PRODUCT</span>
          </div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Product Details</h1>
        </div>
        <div className="flex gap-4">
          <button className="text-sm font-bold text-gray-500 hover:text-brand-dark transition-colors">Discard Draft</button>
          <button className="px-6 py-2.5 bg-brand-dark text-white text-sm font-bold rounded-md hover:bg-brand transition-colors shadow-md">Publish Product</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column (Forms) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Core Information */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2 mb-6">
              <span className="w-6 h-6 rounded-full bg-brand-ocean text-white flex items-center justify-center text-xs">i</span> Core Information
            </h2>
            
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-2">Product Display Name</label>
                <input type="text" placeholder="e.g. Al-Wasel Mineral 500ml Pack of 24" className="w-full bg-gray-100/70 border-0 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-ocean/30 outline-none transition-all placeholder:text-gray-400 font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-2">Category</label>
                  <select className="w-full bg-gray-100/70 border-0 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-ocean/30 outline-none transition-all font-medium text-gray-600 appearance-none">
                    <option>Spring Water</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-2">SKU Identification</label>
                  <input type="text" placeholder="WSL-SPR-500-24" className="w-full bg-gray-100/70 border-0 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-ocean/30 outline-none transition-all placeholder:text-gray-400 font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-2">Product Description</label>
                <textarea rows={4} placeholder="Describe the source purity, mineral content, and packaging features..." className="w-full bg-gray-100/70 border-0 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-ocean/30 outline-none transition-all placeholder:text-gray-400 font-medium resize-y"></textarea>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <h2 className="text-lg font-bold text-brand-dark flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-transparent border-2 border-brand-ocean text-brand-ocean flex items-center justify-center text-xs">🔍</span> SEO Settings
              </div>
              <span className="text-[0.6rem] px-3 py-1 bg-brand-ice text-brand-ocean rounded-full uppercase tracking-widest font-black">Search Engine Optimized</span>
            </h2>
            
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-2">Meta Title</label>
                <input type="text" placeholder="Pure Mineral Water | Wasel Distribution" className="w-full bg-gray-100/70 border-0 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-ocean/30 outline-none transition-all placeholder:text-gray-400 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-2">Meta Description</label>
                <textarea rows={3} placeholder="Wasel Water provides the highest purity standards in regional distribution..." className="w-full bg-gray-100/70 border-0 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-ocean/30 outline-none transition-all placeholder:text-gray-400 font-medium resize-y"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-2">URL Handle (Slug)</label>
                <div className="flex w-full bg-gray-100/70 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-ocean/30 transition-all text-sm font-medium">
                  <span className="text-gray-400 px-4 py-3 select-none">waselwater.com/catalog/</span>
                  <input type="text" placeholder="spring-water-500ml" className="bg-transparent border-0 px-0 flex-1 py-3 outline-none placeholder:text-gray-400 text-brand-dark" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Media & Price) */}
        <div className="flex flex-col gap-8">
          
          {/* Product Media */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-brand-dark flex items-center gap-2 mb-4">
               <span className="text-brand-ocean">🖼</span> Product Media
            </h2>
            <div className="w-full aspect-square bg-[#f4f7fa] rounded-2xl border-2 border-dashed border-[#b0c4df] mb-4 flex flex-col items-center justify-center p-8 text-center relative cursor-pointer hover:bg-brand-ice/50 transition-colors">
               <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 z-10">
                 <UploadCloud className="w-5 h-5 text-gray-400" />
               </div>
               <span className="text-xs font-bold text-brand-dark z-10">Drop your image here</span>
               <span className="text-[0.65rem] font-medium text-gray-400 uppercase tracking-widest mt-1 z-10">PNG, JPG UP TO 10MB</span>
               {/* Background subtle bottle icon to mimic mockup */}
               <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
                 <div className="w-16 h-40 bg-brand-ocean/30 rounded-t-full rounded-b-lg mix-blend-multiply blur-xl"></div>
               </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="aspect-square bg-gray-100 rounded-lg"></div>
              <div className="aspect-square bg-gray-100 rounded-lg"></div>
              <div className="aspect-square bg-gray-200/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                 <span className="text-lg font-medium text-gray-400">+</span>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
             <div className="mb-6">
                <label className="block text-xs font-bold text-brand-dark mb-2">Base Price (AED)</label>
                <input type="text" placeholder="0.00" className="w-full bg-gray-100/70 border-0 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-ocean/30 outline-none transition-all placeholder:text-gray-400 font-medium" />
             </div>
             <div className="mb-6">
               <label className="block text-xs font-bold text-brand-dark mb-2">Stock Quantity</label>
               <input type="number" placeholder="5000" className="w-full bg-gray-100/70 border-0 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-ocean/30 outline-none transition-all placeholder:text-gray-400 font-medium" />
             </div>
             <div>
               <label className="block text-xs font-bold text-brand-dark mb-2">Inventory Status</label>
               <div className="flex bg-gray-100/70 rounded-lg p-1">
                 <button className="flex-1 text-xs font-bold bg-white text-brand-dark shadow-sm py-2 rounded-md">In Stock</button>
                 <button className="flex-1 text-xs font-bold text-gray-400 py-2 hover:text-brand-dark transition-colors">On Hold</button>
                 <button className="flex-1 text-xs font-bold text-gray-400 py-2 hover:text-brand-dark transition-colors">Sold Out</button>
               </div>
             </div>
          </div>

          {/* Logistics */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-brand-dark flex items-center gap-2 mb-6">
               <span className="text-brand-ocean">📦</span> Logistics
            </h2>
            <div className="flex flex-col gap-4 text-sm font-medium">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-500">Unit Weight</span>
                <span className="font-bold text-brand-dark">500ml / 0.5kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Pallet Capacity</span>
                <span className="font-bold text-brand-dark">48 Units</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
