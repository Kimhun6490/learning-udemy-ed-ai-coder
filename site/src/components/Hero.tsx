"use client";

import { motion } from "framer-motion";
import { ArrowDown, Mail } from "lucide-react";
import { profile } from "@/data/profile";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <div className="glow-orb -top-32 left-1/4 h-[500px] w-[500px] bg-[#00e5c2]/15" />
      <div className="glow-orb top-1/3 -right-32 h-[400px] w-[400px] bg-[#ff3366]/10" />
      <div className="absolute inset-0 grid-bg" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-label mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[#00e5c2]" />
            {profile.location}
          </p>

          <h1 className="font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block text-[#8b95a8] text-2xl sm:text-3xl font-semibold mb-2 lg:mb-4">
              Hello, I&apos;m
            </span>
            {profile.name.split(" ")[0]}
            <br />
            <span className="bg-gradient-to-r from-[#00e5c2] via-[#7fffd4] to-[#ff3366] bg-clip-text text-transparent">
              {profile.name.split(" ").slice(1).join(" ")}
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#8b95a8] sm:text-xl">
            <span className="text-[#f4f6fa] font-medium">{profile.title}</span>
            {" — "}
            {profile.tagline}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#journey"
              className="group inline-flex items-center gap-2 rounded-full bg-[#00e5c2] px-6 py-3 text-sm font-semibold text-[#06080c] transition-transform hover:scale-[1.02]"
            >
              View my journey
              <ArrowDown
                size={16}
                className="transition-transform group-hover:translate-y-0.5"
              />
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-[#f4f6fa] backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.06]"
            >
              <Mail size={16} className="text-[#00e5c2]" />
              Get in touch
            </a>
          </div>

          <div className="mt-16 flex flex-wrap gap-3">
            {profile.skills.slice(0, 4).map((skill) => (
              <span
                key={skill.name}
                className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 font-[family-name:var(--font-jetbrains)] text-xs text-[#8b95a8]"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 lg:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="flex flex-col items-center gap-2 text-[#8b95a8]">
            <span className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-widest">
              Scroll
            </span>
            <div className="h-10 w-px bg-gradient-to-b from-[#00e5c2] to-transparent" />
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 select-none font-[family-name:var(--font-syne)] text-[12rem] font-extrabold leading-none text-white/[0.02] lg:block">
        DEV
      </div>
    </section>
  );
}
