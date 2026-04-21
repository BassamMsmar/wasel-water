"use client";

import { updateCartQuantity } from "@/lib/cart";

export function QuantityButton({
  productId,
  quantity,
  delta
}: {
  productId: number;
  quantity: number;
  delta: number;
}) {
  return (
    <button type="button" className="qty-button" onClick={() => updateCartQuantity(productId, quantity + delta)}>
      {delta > 0 ? "+" : "-"}
    </button>
  );
}
