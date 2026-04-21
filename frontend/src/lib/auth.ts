"use client";

import { clearCart } from "./cart";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");
const API_ORIGIN = API_BASE.replace(/\/api\/v\d+\/?$/, "");
const TOKEN_KEY = "wasel-access";
const REFRESH_KEY = "wasel-refresh";

// ─── Token Storage ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  window.dispatchEvent(new Event("auth:changed"));
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  window.dispatchEvent(new Event("auth:changed"));
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "بيانات الدخول غير صحيحة");
  }
  const data = await res.json();
  saveTokens(data.access, data.refresh);
  return data;
}

export async function loginWithIdentifier(identifier: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/identifier-login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "بيانات الدخول غير صحيحة");
  }
  const data = await res.json();
  saveTokens(data.access, data.refresh);
  return data;
}

export async function requestOtp(phone: string) {
  const res = await fetch(`${API_BASE}/auth/otp/request/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.detail || "تعذر إرسال الرمز");
  }
  return data as { success: boolean; phone: string; message: string; debug_code?: string };
}

export async function verifyOtp(phone: string, code: string) {
  const res = await fetch(`${API_BASE}/auth/otp/verify/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "رمز التحقق غير صحيح");
  }
  const data = await res.json();
  saveTokens(data.access, data.refresh);
  return data;
}

export function getGoogleLoginUrl() {
  return `${API_ORIGIN}/accounts/google/login/`;
}

export async function logout() {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (refresh) {
    await fetch(`${API_BASE}/auth/token/blacklist/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }).catch(() => {});
  }
  clearCart();
  clearTokens();
}

export async function getProfile() {
  const token = getAccessToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}/auth/profile/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  return res.json();
}

export async function getMyOrders() {
  const token = getAccessToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/orders/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function authFetchList<T>(path: string): Promise<T[]> {
  const token = getAccessToken();
  if (!token) return [];

  const res = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

type AuthRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
};

export async function authRequest<T>(path: string, options: AuthRequestOptions = {}): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("يجب تسجيل الدخول أولًا");
  }

  const { method = "GET", body } = options;
  const headers: HeadersInit = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message =
      errorBody?.detail ||
      Object.values(errorBody ?? {})?.flat?.()?.[0] ||
      "تعذر تنفيذ العملية";
    throw new Error(String(message));
  }

  if (res.status === 204) {
    return null as T;
  }

  return (await res.json()) as T;
}
