"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "").trim();

    try {
      await login(username, password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "بيانات الدخول غير صحيحة، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-shell">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <span style={{
              width:48, height:48, borderRadius:12, background:"linear-gradient(135deg,#0ea5e9,#38bdf8)",
              display:"grid", placeItems:"center", fontWeight:900, fontSize:"1.4rem", color:"#0c1f3f", flexShrink:0,
              boxShadow:"0 8px 24px rgba(14,165,233,0.3)"
          }}>و</span>
          <div style={{ textAlign:"right" }}>
            <strong>واصل للمياه</strong>
            <small style={{ display:"block" }}>بوابة العملاء</small>
          </div>
        </div>

        <h1 className="login-title">تسجيل الدخول</h1>
        <p className="login-sub">أدخل بياناتك للوصول إلى لوحة التحكم وتتبع طلباتك السابقة الحالية</p>

        <form className="login-form" onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username-input">اسم المستخدم</label>
            <input
              id="username-input"
              name="username"
              type="text"
              className="form-input"
              autoComplete="username"
              placeholder="مثال: admin"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">كلمة المرور</label>
            <input
              id="password-input"
              name="password"
              type="password"
              className="form-input"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            id="login-submit-btn"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
            style={{ marginTop:".5rem" }}
          >
            {loading ? "جار التحقق..." : "دخول 🔓"}
          </button>
        </form>

        <div className="login-footer">
          <p>ليس لديك حساب؟ <Link href="/register">سجل الآن</Link></p>
          <p style={{ marginTop: ".75rem" }}><Link href="/">العودة للرئيسية ←</Link></p>
        </div>
      </div>
    </section>
  );
}
