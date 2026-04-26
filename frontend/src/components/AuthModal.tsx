"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Mail, UserRound, X } from "lucide-react";
import { getGoogleLoginUrl, requestOtp, verifyOtp } from "@/lib/auth";

type AuthMode = "phone" | "email";

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("966")) return `+${digits}`;
  if (digits.startsWith("05")) return `+966${digits.slice(1)}`;
  if (digits.startsWith("5")) return `+966${digits}`;
  return value.trim();
}

function normalizeIdentifier(value: string, mode: AuthMode) {
  return mode === "email" ? value.trim().toLowerCase() : normalizePhone(value);
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
  const [mode, setMode] = useState<AuthMode>("phone");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const modeCopy = useMemo(() => {
    if (mode === "email") {
      return {
        label: "البريد الإلكتروني",
        placeholder: "name@email.com",
        sent: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
        switchText: "تسجيل الدخول برقم الجوال",
      };
    }

    return {
      label: "رقم الجوال",
      placeholder: "051 234 5678",
      sent: "تم إرسال رمز التحقق إلى رقم جوالك",
      switchText: "تسجيل الدخول بالبريد الإلكتروني",
    };
  }, [mode]);

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
      setIdentifier("");
      setStep("identifier");
      setMode("phone");
    }
  }, [open]);

  function switchMode() {
    setMode((current) => (current === "phone" ? "email" : "phone"));
    setIdentifier("");
    setError("");
    setNotice("");
  }

  async function submitIdentifier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const value = identifier.trim();
    if (!value) {
      setError(`اكتب ${modeCopy.label} للمتابعة.`);
      return;
    }

    setLoading(true);
    try {
      const response = await requestOtp(normalizeIdentifier(value, mode));
      setStep("otp");
      setNotice(response.message || modeCopy.sent);
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
      await verifyOtp(normalizeIdentifier(identifier, mode), otp.trim());
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
        <button type="button" className="auth-modal-close" onClick={() => onOpenChange(false)} aria-label="إغلاق">
          <X size={19} aria-hidden="true" />
        </button>

        <div className="auth-modal-avatar" aria-hidden="true">
          <UserRound size={28} />
        </div>

        <div className="auth-modal-copy">
          <h2 id="auth-modal-title">تسجيل الدخول</h2>
          <p>
            {step === "identifier"
              ? "ادخل رقم الجوال أو البريد الإلكتروني وسيتم إرسال رمز تحقق للدخول أو إنشاء حساب جديد."
              : "أدخل رمز التحقق المرسل لإكمال الدخول."}
          </p>
        </div>

        {step === "identifier" ? (
          <form className="auth-modal-form" onSubmit={submitIdentifier}>
            <label className="auth-field">
              <span>{modeCopy.label}</span>
              <div className={`auth-combo-input ${mode === "phone" ? "is-phone" : ""}`}>
                {mode === "phone" ? <div className="auth-country-code">+966</div> : <Mail className="auth-input-icon" size={18} />}
                <input
                  ref={inputRef}
                  name="identifier"
                  type={mode === "email" ? "email" : "tel"}
                  inputMode={mode === "email" ? "email" : "tel"}
                  autoComplete={mode === "email" ? "email" : "tel"}
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder={modeCopy.placeholder}
                  required
                />
              </div>
            </label>

            {error ? <div className="auth-error">{error}</div> : null}

            <button type="submit" className="auth-primary-action" disabled={loading}>
              {loading ? <Loader2 className="auth-spin" size={18} /> : null}
              {loading ? "جاري الإرسال..." : "دخول"}
            </button>

            <button type="button" className="auth-outline-action" onClick={switchMode}>
              {modeCopy.switchText}
            </button>
          </form>
        ) : (
          <form className="auth-modal-form" onSubmit={submitOtp}>
            <div className="auth-sent-note">
              <Check size={18} aria-hidden="true" />
              <span>{notice || modeCopy.sent}</span>
            </div>

            <label className="auth-field">
              <span>رمز التحقق</span>
              <input
                ref={inputRef}
                name="otp"
                inputMode="numeric"
                maxLength={4}
                className="auth-otp-input"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="0 0 0 0"
                required
              />
            </label>

            {error ? <div className="auth-error">{error}</div> : null}

            <button type="submit" className="auth-primary-action" disabled={loading || otp.length < 4}>
              {loading ? <Loader2 className="auth-spin" size={18} /> : <Check size={18} />}
              {loading ? "جاري التحقق..." : "تأكيد الدخول"}
            </button>

            <button type="button" className="auth-outline-action" onClick={() => setStep("identifier")}>
              تغيير البريد أو الجوال
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span />
          <p>أو سجل دخولك من خلال</p>
          <span />
        </div>

        <div className="auth-social-row">
          <a href={getGoogleLoginUrl()} className="auth-social-button" aria-label="المتابعة عبر Google">
            <GoogleIcon />
          </a>
          <button type="button" className="auth-social-button" aria-label="المتابعة عبر Apple" disabled>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.39.07 2.35.74 3.15.8 1.2-.24 2.35-.93 3.62-.84 1.54.12 2.7.72 3.47 1.84-3.16 1.9-2.41 5.73.48 6.82-.57 1.5-1.3 2.98-2.72 4.24M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25" />
            </svg>
          </button>
          <button type="button" className="auth-social-button auth-social-button--fb" aria-label="المتابعة عبر Facebook" disabled>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="#1877f2">
              <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
