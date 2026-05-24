"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "5+", label: "Years shipping" },
  { value: "3", label: "Companies" },
  { value: "Mobile → Web", label: "Stack evolution" },
  { value: "BKK", label: "Based in Bangkok" },
];

export function Stats() {
  return (
    <section className="border-y border-white/[0.06] bg-[#0c1018]/60">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 py-12 lg:grid-cols-4 lg:py-14">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="text-center lg:text-left"
            >
              <p className="font-[family-name:var(--font-syne)] text-2xl font-bold text-[#f4f6fa] sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wider text-[#8b95a8]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
