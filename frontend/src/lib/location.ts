"use client";

import { authRequest, getProfile, isLoggedIn } from "./auth";

export type StoredLocation = {
  latitude: number;
  longitude: number;
  readable_address: string;
  maps_url: string;
  city?: string;
  country?: string;
  neighborhood?: string;
  street?: string;
  postal_code?: string;
};

const LOCATION_KEY = "wasel-location";
const LOCATION_DISMISSED_KEY = "wasel-location-dismissed";
const LOCATION_SYNCED_KEY = "wasel-location-synced";

export function getStoredLocation(): StoredLocation | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LOCATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredLocation;
  } catch {
    return null;
  }
}

export function saveStoredLocation(location: StoredLocation) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  localStorage.removeItem(LOCATION_SYNCED_KEY);
  window.dispatchEvent(new Event("location:changed"));
}

export function dismissLocationPrompt() {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCATION_DISMISSED_KEY, "1");
}

export function shouldPromptForLocation() {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(LOCATION_KEY) && !localStorage.getItem(LOCATION_DISMISSED_KEY);
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<StoredLocation> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ar`
  );
  const data = await response.json();
  const address = data.address || {};
  return {
    latitude,
    longitude,
    readable_address: data.display_name || "تم تحديد الموقع الحالي",
    maps_url: `https://www.google.com/maps?q=${latitude},${longitude}`,
    city: address.city || address.town || address.state || "jeddah - جدة",
    country: address.country || "السعودية",
    neighborhood: address.suburb || address.neighbourhood || "",
    street: address.road || "",
    postal_code: address.postcode || "",
  };
}

export async function syncStoredLocation() {
  if (typeof window === "undefined" || !isLoggedIn()) return null;
  const location = getStoredLocation();
  if (!location) return null;
  const alreadySynced = localStorage.getItem(LOCATION_SYNCED_KEY) === location.maps_url;
  if (alreadySynced) return null;

  const profile = await getProfile();
  const saved = await authRequest("/auth/location/", {
    method: "POST",
    body: {
      ...location,
      phone_number: profile?.phone_number || "",
    },
  });
  localStorage.setItem(LOCATION_SYNCED_KEY, location.maps_url);
  return saved;
}
