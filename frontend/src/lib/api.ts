import type { Brand, Category, Offer, Paginated, Product } from "./types";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

type QueryValue = string | number | boolean | null | undefined;

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function apiFetch<T>(path: string, query?: Record<string, QueryValue>, fallback?: T): Promise<T> {
  try {
    const response = await fetch(buildUrl(path, query), {
      headers: { Accept: "application/json" },
      next: { revalidate: 90 }
    });

    if (!response.ok) {
      return fallback as T;
    }

    return (await response.json()) as T;
  } catch {
    return fallback as T;
  }
}

function normalizeList<T>(payload: Paginated<T> | T[] | undefined | null): T[] {
  if (!payload) return [];
  return Array.isArray(payload) ? payload : payload.results ?? [];
}

export async function getProducts(query?: Record<string, QueryValue>) {
  const payload = await apiFetch<Paginated<Product> | Product[]>("/products/", query, []);
  return normalizeList(payload);
}

export async function getFeaturedProducts() {
  const payload = await apiFetch<Paginated<Product> | Product[]>("/products/featured/", undefined, []);
  return normalizeList(payload);
}

export async function getBestSellers() {
  const payload = await apiFetch<Paginated<Product> | Product[]>("/products/best-sellers/", undefined, []);
  return normalizeList(payload);
}

export async function getProduct(slug: string) {
  return apiFetch<Product | null>(`/products/${encodeURIComponent(slug)}/`, undefined, null);
}

export async function getRelatedProducts(slug: string) {
  const payload = await apiFetch<Paginated<Product> | Product[]>(`/products/${encodeURIComponent(slug)}/related/`, undefined, []);
  return normalizeList(payload);
}

export async function getBrands() {
  const payload = await apiFetch<Paginated<Brand> | Brand[]>("/brands/", undefined, []);
  return normalizeList(payload);
}

export async function getCategories() {
  const payload = await apiFetch<Paginated<Category> | Category[]>("/categories/", undefined, []);
  return normalizeList(payload);
}

export async function getCategoryProducts(slug: string) {
  const payload = await apiFetch<Paginated<Product> | Product[]>(`/categories/${encodeURIComponent(slug)}/products/`, undefined, []);
  return normalizeList(payload);
}

export async function getOffers() {
  const payload = await apiFetch<Paginated<Offer> | Offer[]>("/offers/", undefined, []);
  return normalizeList(payload);
}
