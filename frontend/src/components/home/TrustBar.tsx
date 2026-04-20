export function TrustBar() {
  const items = [
    ["توصيل مرتب", "مسارات واضحة من الفرع للمندوب"],
    ["دفع آمن", "واجهة خفيفة بدون تعقيد"],
    ["منتجات موثوقة", "براندات وتصنيفات قابلة للإدارة"],
    ["SEO جاهز", "صفحات قابلة للأرشفة بمحركات البحث"]
  ];

  return (
    <section className="trust-bar" aria-label="مزايا المتجر">
      {items.map(([title, text]) => (
        <div key={title}>
          <strong>{title}</strong>
          <span>{text}</span>
        </div>
      ))}
    </section>
  );
}
