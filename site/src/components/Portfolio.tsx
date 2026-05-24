"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Lock } from "lucide-react";
import { profile } from "@/data/profile";

export function Portfolio() {
  return (
    <section id="portfolio" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <p className="section-label mb-4">03 — Portfolio</p>
        <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Work &amp; experiments
        </h2>
        <p className="mt-4 max-w-2xl text-[#8b95a8]">
          Case studies and projects are on the way. These slots are reserved for
          what ships next.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profile.portfolio.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group gradient-border flex flex-col p-6 sm:p-7"
            >
              <div className="flex items-start justify-between">
                <span className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-widest text-[#8b95a8]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Lock
                  size={16}
                  className="text-[#8b95a8]/50 transition-colors group-hover:text-[#00e5c2]"
                />
              </div>

              <h3 className="mt-6 font-[family-name:var(--font-syne)] text-xl font-bold">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#8b95a8]">
                {item.description}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                <span className="rounded-full border border-[#ff3366]/30 bg-[#ff3366]/10 px-2.5 py-0.5 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-wider text-[#ff3366]">
                  Coming soon
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#8b95a8]/50">
                  Preview
                  <ArrowUpRight size={12} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
