"use client";

import { useEffect, useMemo, useState } from "react";
import { dismissLocationPrompt, reverseGeocode, saveStoredLocation, shouldPromptForLocation, syncStoredLocation } from "@/lib/location";

export function LocationPrompt() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    setOpen(shouldPromptForLocation());
  }, []);

  useEffect(() => {
    const runSync = async () => {
      try {
        await syncStoredLocation();
      } catch {
        // silent sync failure; local location still kept
      }
    };
    runSync();
  }, []);

  const mapFrame = useMemo(() => {
    if (!previewUrl) return "";
    const match = previewUrl.match(/q=([-\d.]+),([-\d.]+)/);
    if (!match) return "";
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
  }, [previewUrl]);

  async function useCurrentLocation() {
    setError("");
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
        })
      );
      const location = await reverseGeocode(position.coords.latitude, position.coords.longitude);
      saveStoredLocation(location);
      setAddress(location.readable_address);
      setPreviewUrl(location.maps_url);
      await syncStoredLocation();
      setOpen(false);
    } catch {
      setError("تعذر الوصول إلى موقعك الحالي. تأكد من السماح للمتصفح بالوصول إلى الموقع.");
    } finally {
      setLoading(false);
    }
  }

  function skip() {
    dismissLocationPrompt();
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="location-prompt-backdrop" dir="rtl">
      <div className="location-prompt-card">
        <div className="mb-4">
          <span className="eyebrow mb-3">الموقع</span>
          <h2 className="text-2xl font-black text-[#102231]">حدد موقعك لتسهيل التوصيل</h2>
          <p className="mt-3 text-sm leading-7 text-[#6c8093]">
            سنستخدم موقعك لتعبئة بيانات التوصيل تلقائيًا في المرات القادمة، وحفظه في حسابك عند تسجيل الدخول.
          </p>
        </div>

        {mapFrame ? (
          <div className="mb-4 overflow-hidden rounded-[22px] border border-[#dce8f2]">
            <iframe title="خريطة الموقع" src={mapFrame} className="h-[220px] w-full border-0" loading="lazy" />
          </div>
        ) : (
          <div className="mb-4 rounded-[22px] border border-dashed border-[#d6e4ef] bg-[#f8fbff] px-4 py-8 text-center text-sm font-bold text-[#8aa0b4]">
            سيظهر هنا معاينة للموقع بعد استخدام زر تحديد موقعي الحالي.
          </div>
        )}

        {address ? (
          <div className="mb-4 rounded-[18px] border border-[#dce8f2] bg-[#f5faff] px-4 py-3 text-sm font-bold text-[#2d78c8]">
            {address}
          </div>
        ) : null}

        {error ? (
          <div className="alert alert-error mb-4" role="alert">
            <span>تنبيه</span> {error}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" className="btn btn-primary btn-block" onClick={useCurrentLocation} disabled={loading}>
            {loading ? "جارٍ تحديد الموقع..." : "استخدم موقعي الحالي"}
          </button>
          <button type="button" className="btn btn-secondary btn-block" onClick={skip}>
            لاحقًا
          </button>
        </div>
      </div>
    </div>
  );
}
