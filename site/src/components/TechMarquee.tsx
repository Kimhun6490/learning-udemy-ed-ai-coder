"use client";

const items = [
  "Vue.js",
  "Nuxt",
  "Moleculer",
  "Android",
  "TypeScript",
  "Node.js",
  "Microservices",
  "Bangkok",
];

export function TechMarquee() {
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-white/[0.06] py-4">
      <div className="flex animate-marquee gap-12 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-[family-name:var(--font-jetbrains)] text-sm uppercase tracking-[0.2em] text-[#8b95a8]/60"
          >
            {item}
            <span className="mx-12 text-[#00e5c2]/40">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
