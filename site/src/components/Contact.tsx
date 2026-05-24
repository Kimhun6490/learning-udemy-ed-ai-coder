"use client";

import { motion } from "framer-motion";
import { ExternalLink, Mail, MapPin } from "lucide-react";
import { profile } from "@/data/profile";

export function Contact() {
  return (
    <section id="contact" className="relative py-24 lg:py-32">
      <div className="glow-orb bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 bg-[#00e5c2]/10" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="gradient-border relative overflow-hidden p-8 sm:p-12 lg:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00e5c2]/5 via-transparent to-[#ff3366]/5 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <p className="section-label mb-4">06 — Contact</p>
            <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Let&apos;s build something
              <span className="text-[#00e5c2]"> sharp</span>
            </h2>
            <p className="mt-4 max-w-lg text-[#8b95a8]">
              Open to engineering roles, contract work, and collaborations on
              products that matter.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:border-[#00e5c2]/40 hover:bg-[#00e5c2]/5"
              >
                <Mail className="text-[#00e5c2]" size={20} />
                <div>
                  <p className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-wider text-[#8b95a8]">
                    Email
                  </p>
                  <p className="text-sm font-medium">{profile.email}</p>
                </div>
              </a>

              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:border-[#00e5c2]/40 hover:bg-[#00e5c2]/5"
              >
                <ExternalLink className="text-[#00e5c2]" size={20} />
                <div>
                  <p className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-wider text-[#8b95a8]">
                    LinkedIn
                  </p>
                  <p className="text-sm font-medium">Connect →</p>
                </div>
              </a>

              <div className="inline-flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4">
                <MapPin className="text-[#00e5c2]" size={20} />
                <div>
                  <p className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-wider text-[#8b95a8]">
                    Based in
                  </p>
                  <p className="text-sm font-medium">{profile.location}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
