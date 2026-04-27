"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, LockKeyhole, Mail, Phone, UserPlus, X } from "lucide-react";
import {
  getGoogleLoginUrl,
  loginWithIdentifier,
  registerCustomer,
  requestOtp,
  requestPasswordReset,
  verifyOtp,
} from "@/lib/auth";

type AuthMode = "phone" | "email";
type AuthStep = "login" | "otp" | "register";

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

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
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
  const [step, setStep] = useState<AuthStep>("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [registerForm, setRegisterForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const modeCopy = useMemo(() => {
    if (mode === "email") {
      return {
        label: "البريد الإلكتروني",
        placeholder: "name@email.com",
      };
    }

    return {
      label: "رقم الجوال",
      placeholder: "051 234 5678",
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
  }, [onOpenChange, open, step]);

  function selectMode(nextMode: AuthMode) {
    setMode(nextMode);
    setIdentifier("");
    setPassword("");
    setOtp("");
    setError("");
    setNotice("");
    setStep("login");
  }

  function finishLogin() {
    closeModal();
    router.push("/dashboard");
    router.refresh();
  }

  function closeModal() {
    setError("");
    setNotice("");
    setOtp("");
    setPassword("");
    setIdentifier("");
    setStep("login");
    setMode("phone");
    setRegisterForm({ first_name: "", last_name: "", phone_number: "", email: "" });
    onOpenChange(false);
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
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
      if (mode === "phone") {
        const response = await requestOtp(normalizePhone(value));
        setStep("otp");
        setNotice(response.message || "تم إرسال رمز التحقق إلى رقم جوالك");
        return;
      }

      if (!password.trim()) {
        setError("اكتب كلمة المرور للمتابعة.");
        return;
      }

      await loginWithIdentifier(normalizeEmail(value), password);
      finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(normalizePhone(identifier), otp.trim());
      finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "رمز التحقق غير صحيح.");
    } finally {
      setLoading(false);
    }
  }

  async function submitForgotPassword() {
    setError("");
    setNotice("");
    const email = normalizeEmail(identifier);
    if (!email) {
      setError("اكتب البريد الإلكتروني أولًا.");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setNotice("إذا كان البريد مسجلًا، سيصلك رابط إعادة تعيين كلمة المرور.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إرسال رابط إعادة التعيين.");
    } finally {
      setLoading(false);
    }
  }

  async function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      await registerCustomer({
        ...registerForm,
        email: normalizeEmail(registerForm.email),
        phone_number: normalizePhone(registerForm.phone_number),
      });
      finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الحساب.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const title = step === "register" ? "إنشاء حساب جديد" : "تسجيل الدخول";
  const subtitle =
    step === "register"
      ? "أدخل بياناتك الأساسية للمتابعة."
      : mode === "phone"
        ? "أدخل رقم الجوال وسيصلك رمز تحقق لتسجيل الدخول."
        : "أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول.";

  return (
    <div className="auth-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" dir="rtl">
      <button type="button" className="auth-modal-scrim" aria-label="إغلاق تسجيل الدخول" onClick={closeModal} />

      <div className="auth-modal-panel">
        <button type="button" className="auth-modal-close" onClick={closeModal} aria-label="إغلاق">
          <X size={19} aria-hidden="true" />
        </button>

        <div className="auth-brand-lockup" aria-hidden="true">
          <span>واصل</span>
          <small>مياه توصل لبابك</small>
        </div>

        <div className="auth-modal-copy">
          <h2 id="auth-modal-title">{title}</h2>
          <p>{subtitle}</p>
        </div>

        {step === "login" ? (
          <div className="auth-mode-tabs" role="tablist" aria-label="طريقة تسجيل الدخول">
            <button type="button" className={mode === "phone" ? "is-active" : ""} onClick={() => selectMode("phone")}>
              <Phone size={16} />
              الجوال
            </button>
            <button type="button" className={mode === "email" ? "is-active" : ""} onClick={() => selectMode("email")}>
              <Mail size={16} />
              البريد
            </button>
          </div>
        ) : null}

        {step === "register" ? (
          <form className="auth-modal-form" onSubmit={submitRegister}>
            <div className="auth-two-col">
              <label className="auth-field">
                <span>الاسم الأول</span>
                <input
                  ref={inputRef}
                  className="auth-plain-input"
                  value={registerForm.first_name}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, first_name: event.target.value }))}
                  required
                />
              </label>
              <label className="auth-field">
                <span>الاسم الأخير</span>
                <input
                  className="auth-plain-input"
                  value={registerForm.last_name}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, last_name: event.target.value }))}
                  required
                />
              </label>
            </div>
            <label className="auth-field">
              <span>رقم الهاتف</span>
              <div className="auth-combo-input is-phone">
                <div className="auth-country-code">+966</div>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={registerForm.phone_number}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, phone_number: event.target.value }))}
                  placeholder="051 234 5678"
                  required
                />
              </div>
            </label>
            <label className="auth-field">
              <span>البريد الإلكتروني</span>
              <div className="auth-combo-input">
                <span className="auth-input-icon"><Mail size={17} /></span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="name@email.com"
                  required
                />
              </div>
            </label>

            {error ? <div className="auth-error">{error}</div> : null}

            <button type="submit" className="auth-primary-action" disabled={loading}>
              {loading ? <Loader2 className="auth-spin" size={18} /> : <Check size={18} />}
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>

            <button type="button" className="auth-outline-action" onClick={() => setStep("login")}>
              لدي حساب بالفعل
            </button>
          </form>
        ) : step === "login" ? (
          <form className="auth-modal-form" onSubmit={submitLogin}>
            <label className="auth-field">
              <span>{modeCopy.label}</span>
              <div className={`auth-combo-input ${mode === "phone" ? "is-phone" : ""}`}>
                {mode === "phone" ? <div className="auth-country-code">+966</div> : <span className="auth-input-icon"><Mail size={17} /></span>}
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

            {mode === "email" ? (
              <>
                <label className="auth-field">
                  <span>كلمة المرور</span>
                  <div className="auth-combo-input">
                    <span className="auth-input-icon"><LockKeyhole size={17} /></span>
                    <input
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                </label>
                <div className="auth-link-row">
                  <button type="button" onClick={submitForgotPassword} disabled={loading}>
                    نسيت كلمة المرور؟
                  </button>
                  <button type="button" onClick={() => setStep("register")}>
                    مستخدم جديد
                  </button>
                </div>
              </>
            ) : null}

            {notice ? <div className="auth-sent-note">{notice}</div> : null}
            {error ? <div className="auth-error">{error}</div> : null}

            <button type="submit" className="auth-primary-action" disabled={loading}>
              {loading ? <Loader2 className="auth-spin" size={18} /> : null}
              {loading ? "جاري التحقق..." : "دخول"}
            </button>
          </form>
        ) : (
          <form className="auth-modal-form" onSubmit={submitOtp}>
            <div className="auth-sent-note">
              <Check size={18} aria-hidden="true" />
              <span>{notice || "تم إرسال رمز التحقق إلى رقم جوالك"}</span>
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

            <button type="button" className="auth-outline-action" onClick={() => setStep("login")}>
              تغيير رقم الجوال
            </button>
          </form>
        )}

        {step !== "register" ? (
          <>
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
          </>
        ) : null}

        {step === "login" && mode === "phone" ? (
          <button type="button" className="auth-register-shortcut" onClick={() => setStep("register")}>
            <UserPlus size={16} />
            إنشاء حساب جديد
          </button>
        ) : null}
      </div>
    </div>
  );
}
