"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const disabled = product.is_available === false || product.stock === 0;

  return (
    <button
      className="primary-action"
      type="button"
      disabled={disabled}
      onClick={() => {
        addToCart(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
    >
      {disabled ? "غير متوفر" : added ? "تمت الإضافة" : "أضف للسلة"}
    </button>
  );
}
