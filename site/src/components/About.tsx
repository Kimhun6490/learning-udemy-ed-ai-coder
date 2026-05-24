"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { profile } from "@/data/profile";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export function About() {
  return (
    <section id="about" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="section-label mb-4">01 — About</p>
          <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Engineering with
            <span className="text-[#00e5c2]"> intent</span>
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div className="space-y-6">
            {profile.about.map((paragraph, i) => (
              <motion.p
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-base leading-relaxed text-[#8b95a8] sm:text-lg"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="gradient-border p-6 sm:p-8"
          >
            <div className="relative">
              <GraduationCap className="mb-4 text-[#00e5c2]" size={28} />
              <p className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#8b95a8]">
                Education
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-syne)] text-xl font-bold">
                {profile.education.school}
              </h3>
              <p className="mt-2 text-sm text-[#8b95a8]">
                {profile.education.degree}
              </p>
              <p className="text-sm text-[#f4f6fa]/80">
                {profile.education.field}
              </p>

              <div className="mt-8 border-t border-white/[0.06] pt-6">
                <p className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#8b95a8]">
                  Core stack
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="rounded-md bg-[#00e5c2]/10 px-2.5 py-1 font-[family-name:var(--font-jetbrains)] text-xs text-[#00e5c2]"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
