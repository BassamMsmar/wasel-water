const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1")
  .replace(/\/api\/v\d+\/?$/, "")
  .replace(/\/$/, "");

export const fallbackProductImage =
  "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=900&q=80";

export const fallbackBrandImage =
  "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80";

export function absoluteMediaUrl(value: string | null | undefined, fallback = fallbackProductImage) {
  if (!value) return fallback;

  let finalUrl = value;
  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    finalUrl = value.startsWith("/") ? `${API_ORIGIN}${value}` : `${API_ORIGIN}/${value}`;
  }

  // Next.js <Image /> component automatically url-encodes the `src` attribute 
  // into its internal `/_next/image?url=...` endpoint.
  // If we pass an already encoded URL (with %), Next.js will double encode it to %25, causing a 400 Bad Request.
  // By explicitly decoding the URL here, we give Next.js the raw Arabic string to encode correctly.
  try {
    return decodeURI(finalUrl);
  } catch {
    return finalUrl;
  }
}

export function money(value: string | number | null | undefined) {
  const numberValue = Number(value ?? 0);
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}
