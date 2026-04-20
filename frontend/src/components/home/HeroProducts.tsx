import Image from "next/image";
import Link from "next/link";
import { absoluteMediaUrl, money } from "@/lib/media";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "../AddToCartButton";

export function HeroProducts({ products }: { products: Product[] }) {
  const hero      = products[0];
  const secondary = products.slice(1, 4);

  if (!hero) {
    return (
      <section className="hero-section" style={{ gridTemplateColumns:"1fr" }}>
        <div className="hero-content" style={{ textAlign:"center", maxWidth:640, margin:"0 auto" }}>
          <div className="hero-badge">متجر المياه السعودي</div>
          <h1>اطلب مياهك بكل سهولة ووثوقية</h1>
          <p className="hero-subtitle">أفضل براندات المياه بتوصيل سريع لباب بيتك في الرياض وجدة والمدن الكبرى.</p>
          <div className="hero-actions">
            <Link href="/products" className="btn btn-primary btn-lg">تصفح المنتجات</Link>
            <Link href="/brands"   className="btn btn-outline-white btn-lg">كل البراندات</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-section">
      {/* Copy */}
      <div className="hero-content">
        <div className="hero-badge">الأكثر طلباً اليوم</div>
        <h1>
          {hero.brand_data?.name ? <>{hero.brand_data.name}<br /><span>{hero.name}</span></> : <span>{hero.name}</span>}
        </h1>
        <p className="hero-subtitle">
          {hero.description || hero.subtitle || "اختيار مثالي للمنزل والمكتب مع توصيل مرتب وسريع لباب بيتك."}
        </p>

        {(hero.new_price || hero.price) && (
          <div className="hero-price-tag">
            <strong>{money(hero.new_price ?? hero.price)}</strong>
            {hero.old_price && <del>{money(hero.old_price)}</del>}
            {hero.discount_percent ? (
              <span style={{
                background:"rgba(239,68,68,.85)", color:"#fff",
                padding:".2rem .65rem", borderRadius:999, fontSize:".8rem", fontWeight:800
              }}>وفّر {hero.discount_percent}%</span>
            ) : null}
          </div>
        )}

        <div className="hero-actions">
          <AddToCartButton product={hero} />
          <Link href={`/products/${hero.slug}`} className="btn btn-outline-white">
            التفاصيل الكاملة
          </Link>
        </div>

        {/* Mini cards row */}
        {secondary.length > 0 && (
          <div style={{ display:"flex", gap:".6rem", marginTop:"2rem", flexWrap:"wrap" }}>
            {secondary.map(p => (
              <Link key={p.id} href={`/products/${p.slug}`} className="hero-mini-card">
                <Image
                  src={absoluteMediaUrl(p.image)}
                  alt={p.name}
                  width={52}
                  height={52}
                  style={{ width:52, height:52, objectFit:"contain", borderRadius:8, background:"rgba(255,255,255,.1)" }}
                />
                <div>
                  <strong style={{ fontSize:".8rem", display:"block" }}>{p.name}</strong>
                  <span>{money(p.new_price ?? p.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Visual */}
      <div className="hero-visual">
        <Image
          src={absoluteMediaUrl(hero.image)}
          alt={hero.name}
          width={520}
          height={520}
          priority
          style={{ width:"min(100%,480px)", height:"auto", objectFit:"contain" }}
        />
      </div>
    </section>
  );
}
