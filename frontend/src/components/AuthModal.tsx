"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, LogIn, Mail, MessageCircle, Smartphone, X } from "lucide-react";
import { getGoogleLoginUrl, requestOtp, verifyOtp } from "@/lib/auth";

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function normalizeIdentifier(value: string) {
  const trimmed = value.trim();
  if (trimmed.includes("@")) return trimmed.toLowerCase();
  return trimmed.replace(/[^\d+]/g, "");
}

function looksLikePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && !value.includes("@");
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8a6 6 0 1 1 0-12c2.3 0 3.9 1 4.8 1.8l3.2-3.1A10.7 10.7 0 0 0 12 1.5a10.5 10.5 0 1 0 0 21c6 0 10-4.2 10-10.1 0-.7-.1-1.4-.2-2.1H12Z" />
    </svg>
  );
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [debugCode, setDebugCode] = useState("");

  const channelLabel = useMemo(() => {
    if (looksLikePhone(identifier)) return "الجوال";
    if (identifier.includes("@")) return "البريد";
    return "الحساب";
  }, [identifier]);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onOpenChange, open]);

  useEffect(() => {
    if (!open) {
      setError("");
      setNotice("");
      setOtp("");
      setStep("identifier");
    }
  }, [open]);

  async function submitIdentifier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setDebugCode("");

    const value = identifier.trim();
    if (!value) {
      setError("اكتب البريد الإلكتروني أو رقم الجوال للمتابعة.");
      return;
    }

    setLoading(true);
    try {
      const response = await requestOtp(normalizeIdentifier(value));
      setStep("otp");
      setNotice(response.message || "تم إرسال رمز التحقق.");
      setDebugCode(response.debug_code || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إرسال رمز التحقق.");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(normalizeIdentifier(identifier), otp.trim());
      onOpenChange(false);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "رمز التحقق غير صحيح.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="auth-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" dir="rtl">
      <button type="button" className="auth-modal-scrim" aria-label="إغلاق تسجيل الدخول" onClick={() => onOpenChange(false)} />
      <div className="auth-modal-panel">
        <div className="auth-modal-top">
          <div className="auth-modal-mark">
            <LogIn size={20} aria-hidden="true" />
          </div>
          <button type="button" className="auth-modal-close" onClick={() => onOpenChange(false)} aria-label="إغلاق">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="auth-modal-copy">
          <span className="auth-modal-kicker">دخول سريع</span>
          <h2 id="auth-modal-title">ادخل برمز تحقق فقط</h2>
          <p>
            اكتب بريدك أو جوالك، وسيصلك رمز تأكيد تستخدمه للدخول مباشرة بدون كلمة مرور.
          </p>
        </div>

        {step === "identifier" ? (
          <form className="auth-modal-form" onSubmit={submitIdentifier}>
            <label className="form-group">
              <span className="form-label">البريد الإلكتروني أو رقم الجوال</span>
              <div className="auth-input-wrap">
                {looksLikePhone(identifier) ? <Smartphone size={18} /> : <Mail size={18} />}
                <input
                  ref={inputRef}
                  name="identifier"
                  type="text"
                  className="form-input auth-modal-input"
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="name@email.com أو 05xxxxxxxx"
                  required
                />
              </div>
            </label>

            {error ? <div className="alert alert-error"><span>تنبيه</span> {error}</div> : null}

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? <Loader2 className="auth-spin" size={18} /> : <MessageCircle size={18} />}
              {loading ? "جاري إرسال الرمز..." : "إرسال رمز التحقق"}
            </button>
          </form>
        ) : (
          <form className="auth-modal-form" onSubmit={submitOtp}>
            <div className="auth-sent-note">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{notice || `تم إرسال رمز التحقق إلى ${channelLabel}.`}</span>
            </div>

            <label className="form-group">
              <span className="form-label">رمز التحقق</span>
              <input
                ref={inputRef}
                name="otp"
                inputMode="numeric"
                maxLength={4}
                className="form-input auth-otp-input"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="0000"
                required
              />
            </label>

            {debugCode ? <div className="auth-debug-code">رمز الاختبار: {debugCode}</div> : null}
            {error ? <div className="alert alert-error"><span>تنبيه</span> {error}</div> : null}

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading || otp.length < 4}>
              {loading ? <Loader2 className="auth-spin" size={18} /> : <CheckCircle2 size={18} />}
              {loading ? "جاري التحقق..." : "تأكيد الدخول"}
            </button>
            <button type="button" className="btn btn-secondary btn-block" onClick={() => setStep("identifier")}>
              تغيير البريد أو الجوال
            </button>
          </form>
        )}

        <a href={getGoogleLoginUrl()} className="auth-google-link">
          <GoogleIcon />
          المتابعة عبر Google
        </a>
      </div>
    </div>
  );
}
