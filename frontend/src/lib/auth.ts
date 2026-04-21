"use client";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");
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

export async function logout() {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (refresh) {
    await fetch(`${API_BASE}/auth/token/blacklist/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }).catch(() => {});
  }
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
