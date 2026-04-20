"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product, showQty = false }: { product: Product; showQty?: boolean }) {
  const [qty,   setQty]   = useState(1);
  const [added, setAdded] = useState(false);
  const disabled = product.is_available === false || product.stock === 0;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (disabled) {
    return (
      <button className="btn-cart" disabled style={{ width: showQty ? "100%" : undefined }}>
        غير متوفر حالياً
      </button>
    );
  }

  if (showQty) {
    return (
      <div className="detail-cart-section">
        <div className="detail-qty-row">
          <span className="detail-qty-label">الكمية:</span>
          <div className="qty-stepper">
            <button
              type="button"
              className="qty-btn"
              aria-label="تقليل الكمية"
              onClick={() => setQty(q => Math.max(1, q - 1))}
            >−</button>
            <span className="qty-value" aria-live="polite">{qty}</span>
            <button
              type="button"
              className="qty-btn"
              aria-label="زيادة الكمية"
              onClick={() => setQty(q => q + 1)}
            >+</button>
          </div>
        </div>

        <button
          type="button"
          id="add-to-cart-btn"
          className={`btn btn-cart btn-lg btn-block ${added ? "added" : ""}`}
          onClick={handleAdd}
        >
          {added ? "✅ تمت الإضافة للسلة!" : `🛒 أضف للسلة`}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`btn btn-cart btn-sm ${added ? "added" : ""}`}
      onClick={handleAdd}
      style={{ width: "100%", marginTop: ".5rem" }}
    >
      {added ? "✅ أُضيف!" : "🛒 أضف للسلة"}
    </button>
  );
}
