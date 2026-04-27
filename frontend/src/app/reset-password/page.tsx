"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { confirmPasswordReset } from "@/lib/auth";

function ResetPasswordForm() {
  const params = useSearchParams();
  const uid = params.get("uid") || "";
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const canSubmit = useMemo(() => uid && token && password.length >= 8 && password === confirmPassword, [confirmPassword, password, token, uid]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!uid || !token) {
      setError("رابط إعادة التعيين غير صالح.");
      return;
    }
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(uid, token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحديث كلمة المرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell grid min-h-[65vh] place-items-center" dir="rtl">
      <section className="w-full max-w-[420px] rounded-[10px] border border-[#dfeaf4] bg-white p-6 shadow-sm">
        {done ? (
          <div className="grid gap-4 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e6f8f1] text-[#12805c]">
              <Check size={24} />
            </div>
            <h1 className="text-xl font-black text-[#102231]">تم تحديث كلمة المرور</h1>
            <p className="text-sm font-bold leading-7 text-[#617386]">يمكنك الآن تسجيل الدخول بالبريد الإلكتروني وكلمة المرور الجديدة.</p>
            <Link className="auth-primary-action" href="/login">
              تسجيل الدخول
            </Link>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-2 text-center">
              <h1 className="text-xl font-black text-[#102231]">إعادة تعيين كلمة المرور</h1>
              <p className="text-sm font-bold leading-7 text-[#617386]">اختر كلمة مرور جديدة لحسابك.</p>
            </div>

            <label className="auth-field">
              <span>كلمة المرور الجديدة</span>
              <input
                className="auth-plain-input"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <label className="auth-field">
              <span>تأكيد كلمة المرور</span>
              <input
                className="auth-plain-input"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </label>

            {error ? <div className="auth-error">{error}</div> : null}

            <button type="submit" className="auth-primary-action" disabled={loading || !canSubmit}>
              {loading ? <Loader2 className="auth-spin" size={18} /> : null}
              {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
