"use client";

import type { CartItem } from "./types";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

export type CheckoutPayload = {
  full_name: string;
  phone: string;
  city: string;
  address: string;
  country?: string;
  postal_code?: string;
  location_link?: string;
  note?: string;
  payment_method?: "cod" | "bank_transfer" | "card";
  transfer_reference?: string;
  transfer_date?: string;
  transfer_amount?: string;
  transfer_receipt?: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
};

export type CheckoutResponse = {
  id: number;
  status: string;
  total_price: string;
  message: string;
};

export function buildCheckoutPayload(formData: FormData, items: CartItem[]): CheckoutPayload {
  return {
    full_name: String(formData.get("full_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    postal_code: String(formData.get("postal_code") ?? "").trim(),
    location_link: String(formData.get("location_link") ?? "").trim(),
    note: String(formData.get("note") ?? "").trim(),
    payment_method: String(formData.get("payment_method") ?? "cod").trim() as "cod" | "bank_transfer" | "card",
    transfer_reference: String(formData.get("transfer_reference") ?? "").trim(),
    transfer_date: String(formData.get("transfer_date") ?? "").trim(),
    transfer_amount: String(formData.get("transfer_amount") ?? "").trim(),
    transfer_receipt: String(formData.get("transfer_receipt") ?? "").trim(),
    items: items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity
    }))
  };
}

export async function submitCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const response = await fetch(`${API_BASE}/checkout/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || error?.message || "تعذر إرسال الطلب. راجع البيانات وحاول مرة أخرى.");
  }

  return (await response.json()) as CheckoutResponse;
}
