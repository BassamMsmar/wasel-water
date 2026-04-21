"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getGoogleLoginUrl, loginWithIdentifier, requestOtp, verifyOtp } from "@/lib/auth";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8a6 6 0 1 1 0-12c2.3 0 3.9 1 4.8 1.8l3.2-3.1A10.7 10.7 0 0 0 12 1.5a10.5 10.5 0 1 0 0 21c6 0 10-4.2 10-10.1 0-.7-.1-1.4-.2-2.1H12Z" />
    </svg>
  );
}

function normalizeDigits(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function looksLikePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && !value.includes("@");
}

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"identifier" | "password" | "otp">("identifier");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [debugCode, setDebugCode] = useState("");

  const isPhoneFlow = useMemo(() => looksLikePhone(identifier.trim()), [identifier]);

  async function continueFromIdentifier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const value = identifier.trim();
    if (!value) {
      setError("أدخل رقم الجوال أو البريد الإلكتروني أو اسم المستخدم.");
      return;
    }

    if (looksLikePhone(value)) {
      setLoading(true);
      try {
        const response = await requestOtp(normalizeDigits(value));
        setStep("otp");
        setNotice(response.message);
        setDebugCode(response.debug_code || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر إرسال رمز التحقق.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setStep("password");
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithIdentifier(identifier.trim(), password.trim());
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "بيانات الدخول غير صحيحة.");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(normalizeDigits(identifier.trim()), otp.trim());
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "رمز التحقق غير صحيح.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen bg-[linear-gradient(135deg,#f7fbff_0%,#e9f3fd_48%,#f9fcff_100%)]" dir="rtl">
      <div className="mx-auto grid min-h-screen w-full max-w-[1240px] items-center gap-8 px-4 py-10 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="hidden lg:block">
          <div className="rounded-[36px] border border-[#dce8f2] bg-[radial-gradient(circle_at_top_left,#dff0ff_0%,#f7fbff_45%,#ffffff_100%)] p-8 shadow-[0_18px_48px_rgba(10,34,56,0.08)]">
            <span className="eyebrow mb-4">بوابة واصل</span>
            <h1 className="text-[3rem] font-black leading-[1.05] text-[#102231]">دخول واضح وسريع للعملاء والإدارة</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#6a7f93]">
              استخدم رقم الجوال للدخول برمز تحقق، أو البريد الإلكتروني واسم المستخدم مع كلمة المرور. نفس التجربة أصبحت أوضح وأنظف وبدون تداخل مع هيدر وفوتر المتجر.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["OTP للجوال", "Google للدخول", "جلسة محفوظة"].map((item) => (
                <div key={item} className="rounded-[22px] border border-[#dbe7f2] bg-white/85 px-4 py-4 text-sm font-black text-[#123e67]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-[#dce8f2] bg-white p-6 shadow-[0_20px_50px_rgba(10,34,56,0.1)] md:p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#e8f2ff] text-xl font-black text-[#123e67]">و</div>
            <div>
              <div className="text-lg font-black text-[#102231]">واصل لتوزيع المياه</div>
              <div className="text-sm font-bold text-[#7b90a4]">تسجيل الدخول</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-[2rem] font-black text-[#102231]">مرحبًا من جديد</h2>
            <p className="mt-3 text-sm leading-7 text-[#6d8092]">
              {step === "identifier" ? "ابدأ بإدخال الجوال أو البريد أو اسم المستخدم." : step === "password" ? "أدخل كلمة المرور للمتابعة." : "أدخل رمز التحقق المرسل إلى جوالك."}
            </p>
          </div>

          {step === "identifier" ? (
            <form className="grid gap-4" onSubmit={continueFromIdentifier}>
              <label className="form-group">
                <span className="form-label">الجوال أو البريد أو اسم المستخدم</span>
                <input
                  name="identifier"
                  type="text"
                  className="form-input"
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="05xxxxxxxx أو name@email.com"
                  required
                />
              </label>

              {error ? <div className="alert alert-error"><span>تنبيه</span> {error}</div> : null}

              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                {loading ? "جارٍ التحقق..." : isPhoneFlow ? "إرسال رمز التحقق" : "متابعة"}
              </button>
            </form>
          ) : null}

          {step === "password" ? (
            <form className="grid gap-4" onSubmit={submitPassword}>
              <label className="form-group">
                <span className="form-label">الهوية المدخلة</span>
                <input className="form-input" value={identifier} readOnly />
              </label>
              <label className="form-group">
                <span className="form-label">كلمة المرور</span>
                <input
                  name="password"
                  type="password"
                  className="form-input"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
              </label>

              {error ? <div className="alert alert-error"><span>تنبيه</span> {error}</div> : null}

              <div className="grid gap-3">
                <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                  {loading ? "جارٍ تسجيل الدخول..." : "دخول"}
                </button>
                <button type="button" className="btn btn-secondary btn-block" onClick={() => setStep("identifier")}>
                  تغيير الطريقة
                </button>
              </div>
            </form>
          ) : null}

          {step === "otp" ? (
            <form className="grid gap-4" onSubmit={submitOtp}>
              <label className="form-group">
                <span className="form-label">رقم الجوال</span>
                <input className="form-input" value={identifier} readOnly />
              </label>
              <label className="form-group">
                <span className="form-label">رمز التحقق</span>
                <input
                  name="otp"
                  inputMode="numeric"
                  maxLength={4}
                  className="form-input text-center tracking-[0.4em]"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="0000"
                  required
                />
              </label>

              {notice ? (
                <div className="rounded-[20px] border border-[#d9e9f7] bg-[#f5faff] px-4 py-3 text-sm font-bold text-[#2d78c8]">
                  {notice}
                  {debugCode ? <div className="mt-2 text-xs text-[#6f8192]">رمز الاختبار: {debugCode}</div> : null}
                </div>
              ) : null}

              {error ? <div className="alert alert-error"><span>تنبيه</span> {error}</div> : null}

              <div className="grid gap-3">
                <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                  {loading ? "جارٍ التحقق..." : "تأكيد الرمز"}
                </button>
                <button type="button" className="btn btn-secondary btn-block" onClick={() => setStep("identifier")}>
                  تغيير الرقم
                </button>
              </div>
            </form>
          ) : null}

          <div className="mt-5">
            <a href={getGoogleLoginUrl()} className="inline-flex w-full items-center justify-center gap-3 rounded-[18px] border border-[#dce8f2] bg-white px-5 py-3 text-sm font-black text-[#102231] transition hover:border-[#bfd7ee] hover:bg-[#f8fbff]">
              <GoogleIcon />
              المتابعة عبر Google
            </a>
          </div>

          <div className="mt-6 text-center text-sm font-bold text-[#6f8192]">
            <Link href="/" className="transition hover:text-[#102231]">العودة إلى الرئيسية</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
