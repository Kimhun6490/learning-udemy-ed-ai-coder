"use client";

import { motion } from "framer-motion";
import { profile } from "@/data/profile";

export function Journey() {
  return (
    <section id="journey" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c1018]/50 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <p className="section-label mb-4">02 — Career</p>
        <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          The journey so far
        </h2>
        <p className="mt-4 max-w-2xl text-[#8b95a8]">
          Five years across enterprise comms, digital agencies, and full-stack —
          from service engineering to senior mobile and modern web.
        </p>

        <div className="relative mt-16 lg:px-8">
          <div className="absolute left-[7px] top-2 bottom-2 w-px timeline-line lg:left-1/2 lg:-ml-px" />

          <div className="space-y-10 lg:space-y-14">
            {profile.experience.map((job, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.article
                  key={`${job.company}-${job.role}-${job.period}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    delay: index * 0.06,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative lg:grid lg:grid-cols-2 lg:gap-16"
                >
                  <div
                    className={`absolute left-0 top-6 z-10 h-4 w-4 rounded-full border-2 border-[#00e5c2] bg-[#06080c] shadow-[0_0_12px_rgba(0,229,194,0.5)] lg:left-1/2 lg:-ml-2 ${
                      job.highlight ? "!bg-[#00e5c2]" : ""
                    }`}
                  />

                  <div
                    className={`pl-10 lg:pl-0 ${
                      isEven
                        ? "lg:col-start-1 lg:pr-10"
                        : "lg:col-start-2 lg:pl-10"
                    }`}
                  >
                    <div
                      className={`gradient-border p-6 sm:p-7 ${
                        job.highlight
                          ? "shadow-[0_0_40px_rgba(0,229,194,0.08)]"
                          : ""
                      }`}
                    >
                      {job.highlight && (
                        <span className="mb-3 inline-block rounded-full bg-[#ff3366]/15 px-2.5 py-0.5 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-wider text-[#ff3366]">
                          Current
                        </span>
                      )}
                      <p className="font-[family-name:var(--font-jetbrains)] text-xs text-[#00e5c2]">
                        {job.period}
                      </p>
                      <h3 className="mt-1 font-[family-name:var(--font-syne)] text-xl font-bold">
                        {job.role}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-[#f4f6fa]/90">
                        {job.company}
                      </p>
                      <p className="mt-0.5 text-xs text-[#8b95a8]">
                        {job.location}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-[#8b95a8]">
                        {job.description}
                      </p>
                    </div>
                  </div>

                  <div className="hidden lg:block" aria-hidden />
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
