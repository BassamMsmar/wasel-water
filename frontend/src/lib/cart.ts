"use client";

import type { CartItem, Product } from "./types";

const CART_KEY = "wasel-water-cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(CART_KEY);
    return value ? (JSON.parse(value) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:changed"));
}

export function clearCart() {
  writeCart([]);
}

export function addToCart(product: Product, quantity = 1) {
  const items = readCart();
  const index = items.findIndex((item) => item.product.id === product.id);
  if (index >= 0) {
    items[index] = { ...items[index], quantity: items[index].quantity + quantity };
  } else {
    items.push({ product, quantity });
  }
  writeCart(items);
}

export function updateCartQuantity(productId: number, quantity: number) {
  const items = readCart()
    .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
  writeCart(items);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + Number(item.product.new_price ?? item.product.price ?? 0) * item.quantity, 0);
}
