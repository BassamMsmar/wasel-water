"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { absoluteMediaUrl, money } from "@/lib/media";
import type { Product } from "@/lib/types";

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3h2l2.4 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.5L22 8H6.2" />
    </svg>
  );
}

export function ProductCard({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "featured";
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const price = product.new_price ?? product.price;
  const brand = product.brand_data?.name ?? product.category_data?.name ?? "منتج مميز";
  const size = product.tags?.[0] ?? "330 مل";
  const pack = product.tags?.[1] ?? "40 عبوة";
  const disabled = product.is_available === false || product.stock === 0;

  const handleAdd = () => {
    if (disabled) return;
    addToCart(product, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-[26px] border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(10,34,56,0.1)] ${
        variant === "featured"
          ? "border-[#dce9f5] shadow-[0_18px_48px_rgba(10,34,56,0.08)]"
          : "border-[#e4edf5] shadow-[0_12px_30px_rgba(10,34,56,0.05)]"
      }`}
    >
      <Link
        href={`/products/${product.slug}`}
        className={`relative block overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f5faff_100%)] ${
          variant === "featured" ? "min-h-[270px]" : "min-h-[220px]"
        }`}
      >
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-4">
          <span className="rounded-full border border-[#d0e2f3] bg-white/90 px-3 py-1 text-[11px] font-black text-[#1a5d98] shadow-[0_6px_16px_rgba(10,34,56,0.05)]">
            {brand}
          </span>
          <div className="flex flex-wrap justify-end gap-1.5">
            <span className="rounded-full bg-[#2d78c8] px-2.5 py-1 text-[10px] font-black text-white">
              {size}
            </span>
            <span className="rounded-full border border-[#d0e2f3] bg-white/92 px-2.5 py-1 text-[10px] font-black text-[#2d78c8]">
              {pack}
            </span>
          </div>
        </div>

        <Image
          src={absoluteMediaUrl(product.image)}
          alt={product.name}
          fill
          unoptimized
          className="object-contain p-8 pt-14 transition duration-500 group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-[3.4rem] text-[1.02rem] font-black leading-7 text-[#102231] transition group-hover:text-[#1f69b1]">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 min-h-[2.8rem] text-sm leading-7 text-[#748698]">
          {product.description || product.subtitle || `توصيل سريع ومخزون جاهز من ${brand}.`}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3 border-t border-[#edf3f8] pt-4">
            <div className="min-w-0">
              <strong className="block text-xl font-black leading-none text-[#2d78c8]">
                {money(price)}
              </strong>
              <span className="mt-1 block text-[11px] font-bold text-[#97a7b7]">
                شامل الضريبة
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-[#dbe7f2] bg-[#fbfdff] p-1 shadow-[0_6px_16px_rgba(10,34,56,0.04)]">
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#607487] transition hover:bg-[#edf5fc] hover:text-[#102231]"
                  onClick={() => setQty((current) => Math.max(1, current - 1))}
                  aria-label="تقليل الكمية"
                >
                  -
                </button>
                <span className="min-w-[22px] text-center text-xs font-black text-[#102231]">
                  {qty}
                </span>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#607487] transition hover:bg-[#edf5fc] hover:text-[#102231]"
                  onClick={() => setQty((current) => current + 1)}
                  aria-label="زيادة الكمية"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={disabled}
                aria-label="إضافة إلى السلة"
                className={`flex h-10 w-10 items-center justify-center rounded-full text-white transition ${
                  disabled
                    ? "cursor-not-allowed bg-[#b8c5d2]"
                    : added
                      ? "bg-[#2d78c8]"
                      : "bg-[#123e67] hover:bg-[#2d78c8]"
                }`}
              >
                <CartIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
