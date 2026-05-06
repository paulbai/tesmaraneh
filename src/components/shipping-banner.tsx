"use client";

export function ShippingBanner() {
  const text = "For international shipping, contact us directly";
  const items = Array.from({ length: 12 }, (_, i) => (
    <span
      key={i}
      className="mx-8 text-[11px] sm:text-xs tracking-[0.25em] uppercase font-[family-name:var(--font-body)] font-medium text-white/90"
    >
      {text}
      <span className="text-[var(--ochre-light)] ml-8">&#x2726;</span>
    </span>
  ));

  return (
    <div className="bg-[var(--charcoal)] py-2 overflow-hidden relative z-[60]">
      <div className="animate-shipping-marquee flex whitespace-nowrap">
        {items}
        {items}
      </div>
    </div>
  );
}
