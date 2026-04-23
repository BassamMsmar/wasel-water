import type {
  Banner,
  Brand,
  Branch,
  Category,
  Company,
  Customer,
  FeaturedProduct,
  Flag,
  Offer,
  OrderStatus,
  Paginated,
  Product,
  UserAccount,
} from "./types";

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
      cache: process.env.NODE_ENV === "development" ? "no-store" : "force-cache",
      next: process.env.NODE_ENV === "development" ? undefined : { revalidate: 60 }
    });

    if (!response.ok) {
      console.error(`API Error ${response.status} for ${path}`);
      return fallback as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`API fetch failed for ${path}:`, error);
    return fallback as T;
  }
}

function normalizeList<T>(payload: Paginated<T> | T[] | undefined | null): T[] {
  if (!payload) return [];
  return Array.isArray(payload) ? payload : payload.results ?? [];
}

// ─── Products ────────────────────────────────────────────────────────────────

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
  return apiFetch<Product | null>(`/products/${slug}/`, undefined, null);
}

export async function getRelatedProducts(slug: string) {
  const payload = await apiFetch<Paginated<Product> | Product[]>(
    `/products/${slug}/related/`,
    undefined,
    []
  );
  return normalizeList(payload);
}

// ─── Brands ──────────────────────────────────────────────────────────────────

export async function getBrands() {
  const payload = await apiFetch<Paginated<Brand> | Brand[]>("/brands/", undefined, []);
  return normalizeList(payload);
}

export async function getBrand(slug: string) {
  return apiFetch<Brand | null>(`/brands/${slug}/`, undefined, null);
}

export async function getBrandProducts(slug: string) {
  const payload = await apiFetch<Paginated<Product> | Product[]>(
    `/brands/${slug}/products/`,
    undefined,
    []
  );
  return normalizeList(payload);
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories() {
  const payload = await apiFetch<Paginated<Category> | Category[]>("/categories/", undefined, []);
  return normalizeList(payload);
}

export async function getCategory(slug: string) {
  return apiFetch<Category | null>(`/categories/${slug}/`, undefined, null);
}

export async function getCategoryProducts(slug: string) {
  const payload = await apiFetch<Paginated<Product> | Product[]>(
    `/categories/${slug}/products/`,
    undefined,
    []
  );
  return normalizeList(payload);
}

// ─── Offers ──────────────────────────────────────────────────────────────────

export async function getOffers() {
  const payload = await apiFetch<Paginated<Offer> | Offer[]>("/offers/", undefined, []);
  return normalizeList(payload);
}

export async function getCompanies() {
  const payload = await apiFetch<Paginated<Company> | Company[]>("/companies/", undefined, []);
  return normalizeList(payload);
}

export async function getBanners() {
  const payload = await apiFetch<Paginated<Banner> | Banner[]>("/banners/", undefined, []);
  return normalizeList(payload);
}

export async function getFlags() {
  const payload = await apiFetch<Paginated<Flag> | Flag[]>("/flags/", undefined, []);
  return normalizeList(payload);
}

export async function getFeaturedProductRecords() {
  const payload = await apiFetch<Paginated<FeaturedProduct> | FeaturedProduct[]>("/featured-products/", undefined, []);
  return normalizeList(payload);
}

export async function getBranches() {
  const payload = await apiFetch<Paginated<Branch> | Branch[]>("/branches/", undefined, []);
  return normalizeList(payload);
}

export async function getOrderStatuses() {
  const payload = await apiFetch<Paginated<OrderStatus> | OrderStatus[]>("/order-statuses/", undefined, []);
  return normalizeList(payload);
}

export async function getUsers() {
  const payload = await apiFetch<Paginated<UserAccount> | UserAccount[]>("/users/", undefined, []);
  return normalizeList(payload);
}

export async function getCustomers() {
  const payload = await apiFetch<Paginated<Customer> | Customer[]>("/customers/", undefined, []);
  return normalizeList(payload);
}
