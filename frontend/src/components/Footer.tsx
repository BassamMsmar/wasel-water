import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">

        {/* Brand */}
        <div className="footer-brand">
          <div style={{ display:"flex", alignItems:"center", gap:".75rem", marginBottom:".75rem" }}>
            <span style={{
              width:40, height:40, borderRadius:8, background:"linear-gradient(135deg,#0ea5e9,#38bdf8)",
              display:"grid", placeItems:"center", fontWeight:900, fontSize:"1.2rem", color:"#0c1f3f", flexShrink:0
            }}>و</span>
            <div>
              <strong style={{ color:"#fff", fontSize:"1rem", fontWeight:900, display:"block" }}>واصل للمياه</strong>
              <small style={{ color:"rgba(255,255,255,.5)", fontSize:".75rem" }}>متجر المياه السعودي</small>
            </div>
          </div>
          <p>نوصّل أفضل براندات المياه لباب بيتك بشكل سريع وموثوق. خدمة تغطي الرياض وجدة والمدن الرئيسية.</p>
          <div style={{ display:"flex", gap:".5rem", marginTop:"1rem", flexWrap:"wrap" }}>
            {["مرخّص", "توصيل سريع", "منتجات أصلية"].map(b => (
              <span key={b} style={{
                padding:".2rem .65rem", border:"1px solid rgba(255,255,255,.15)",
                borderRadius:999, fontSize:".72rem", color:"rgba(255,255,255,.5)"
              }}>{b}</span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="footer-col">
          <h4>المتجر</h4>
          <nav className="footer-links" aria-label="روابط المتجر">
            <Link href="/products">كل المنتجات</Link>
            <Link href="/brands">البراندات</Link>
            <Link href="/categories/عروض">العروض</Link>
            <Link href="/cart">سلة التسوق</Link>
          </nav>
        </div>

        {/* Account */}
        <div className="footer-col">
          <h4>حسابي</h4>
          <nav className="footer-links" aria-label="روابط الحساب">
            <Link href="/login">تسجيل الدخول</Link>
            <Link href="/dashboard">طلباتي</Link>
            <Link href="/dashboard">تتبع الطلب</Link>
          </nav>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4>تواصل معنا</h4>
          <div className="footer-contact-item">
            <span>📞</span>
            <a href="tel:+966500000000" style={{ color:"rgba(255,255,255,.6)" }}>920-000-0000</a>
          </div>
          <div className="footer-contact-item">
            <span>💬</span>
            <a href="https://wa.me/966500000000" target="_blank" rel="noreferrer"
               style={{ color:"#25d366", fontWeight:700 }}>واتساب — 24/7</a>
          </div>
          <div className="footer-contact-item">
            <span>✉️</span>
            <a href="mailto:info@wasel.sa" style={{ color:"rgba(255,255,255,.6)" }}>info@wasel.sa</a>
          </div>
          <div className="footer-contact-item" style={{ marginTop:".5rem" }}>
            <span>⏰</span>
            <span>السبت – الخميس: 8ص – 10م</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>© {new Date().getFullYear()} واصل للمياه. جميع الحقوق محفوظة.</span>
          <div className="footer-bottom-badges">
            <span className="footer-badge">🔒 دفع آمن</span>
            <span className="footer-badge">🇸🇦 منتجات سعودية</span>
            <span className="footer-badge">✅ ضمان الجودة</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
