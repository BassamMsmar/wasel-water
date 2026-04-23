export function TrustBar() {
  const items = [
    { icon: "01", title: "توصيل لباب البيت",    text: "خلال 24 ساعة داخل المدينة" },
    { icon: "02", title: "منتجات أصلية 100%",   text: "براندات موثوقة ومعتمدة" },
    { icon: "03", title: "استبدال مضمون",        text: "في حال وجود أي مشكلة" },
    { icon: "04", title: "دعم على واتساب",       text: "متاح يومياً من 8ص – 10م" },
  ];

  return (
    <section className="trust-bar" aria-label="مزايا المتجر">
      <div className="trust-bar-inner">
        {items.map(({ icon, title, text }) => (
          <div key={title} className="trust-item">
            <div className="trust-icon" aria-hidden="true">{icon}</div>
            <div>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
