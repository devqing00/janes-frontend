"use client";

export default function MarqueeBanner() {
  const items = [
    "NEW ARRIVALS",
    "✦",
    "CRAFTED IN LAGOS",
    "✦",
    "FREE SHIPPING OVER ₦500,000",
    "✦",
    "LUXURIOUS & CONTEMPORARY",
    "✦",
    "HANDWOVEN ASO-OKE",
    "✦",
    "DESIGNED FOR YOU",
    "✦",
  ];

  return (
    <div className="bg-[#1A1A1A] border-y border-white/[0.06] overflow-hidden py-3.5 select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className={`mx-8 uppercase text-[10px] tracking-[0.3em] font-light ${
              item === "✦"
                ? "text-brand-accent/60"
                : "text-white/40"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
