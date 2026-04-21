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

  const price = product.new_price ?? product.price ?? product.old_price;
  const oldPrice =
    product.old_price && Number(product.old_price) > Number(price ?? 0)
      ? product.old_price
      : null;
  const brand = product.brand_data?.name ?? "منتج مميز";
  const size = product.tags?.[0] ?? "330 مل";
  const pack = product.tags?.[1] ?? "40 عبوة";
  const disabled = product.is_available === false || product.stock === 0;
  const imageHeight = variant === "featured" ? "min-h-[270px]" : "min-h-[220px]";

  const handleAdd = () => {
    if (disabled) return;
    addToCart(product, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#d9e6f2] bg-white shadow-[0_2px_10px_rgba(10,34,56,0.015)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(10,34,56,0.02)]">
      <Link
        href={`/products/${product.slug}`}
        className={`relative block overflow-hidden bg-[linear-gradient(180deg,#fafdff_0%,#eaf4ff_100%)] ${imageHeight}`}
      >
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
          <span className="rounded-full border border-[#cfe0f2] bg-white/92 px-2.5 py-1 text-[10px] font-black text-[#1d639f]">
            {brand}
          </span>
          <div className="flex flex-wrap justify-end gap-1">
            <span className="rounded-full bg-[#2d78c8] px-2 py-1 text-[9px] font-black text-white">
              {size}
            </span>
            <span className="rounded-full border border-[#cfe0f2] bg-white/92 px-2 py-1 text-[9px] font-black text-[#2d78c8]">
              {pack}
            </span>
          </div>
        </div>

        <Image
          src={absoluteMediaUrl(product.image)}
          alt={product.name}
          fill
          unoptimized
          className="object-contain p-1 pt-12 transition duration-500 group-hover:scale-[1.05]"
        />
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-3 pt-3">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-[0.98rem] font-black leading-6 text-[#102231] transition group-hover:text-[#1f69b1]">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1.5 line-clamp-2 text-xs leading-6 text-[#77889a]">
          {product.description || product.subtitle || `توصيل سريع ومخزون جاهز من ${brand}.`}
        </p>

        <div className="mt-3 flex items-end justify-between gap-3 text-right">
          {oldPrice ? (
            <del className="text-xs font-bold text-[#97a7b7]">
              {money(oldPrice)}
            </del>
          ) : (
            <span />
          )}
          <strong className="text-base font-black leading-none text-[#2d78c8]">
            {money(price)}
          </strong>
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-center gap-2 border-t border-[#edf3f8] pt-3">
            <div className="flex items-center gap-1 rounded-full border border-[#dbe7f2] bg-[#fbfdff] p-1">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#607487] transition hover:bg-[#edf5fc] hover:text-[#102231]"
                onClick={() => setQty((current) => Math.max(1, current - 1))}
                aria-label="تقليل الكمية"
              >
                -
              </button>
              <span className="min-w-[18px] text-center text-xs font-black text-[#102231]">
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
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition ${
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
    </article>
  );
}
