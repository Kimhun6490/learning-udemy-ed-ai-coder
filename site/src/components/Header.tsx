"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks, profile } from "@/data/profile";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/[0.06] bg-[#06080c]/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <a
          href="#"
          className="font-[family-name:var(--font-syne)] text-sm font-bold tracking-tight"
        >
          KM<span className="text-[#00e5c2]">.</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#8b95a8] transition-colors hover:text-[#f4f6fa]"
            >
              {link.label}
            </a>
          ))}
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#00e5c2]/40 bg-[#00e5c2]/10 px-4 py-1.5 text-sm font-medium text-[#00e5c2] transition-all hover:border-[#00e5c2] hover:bg-[#00e5c2]/20"
          >
            LinkedIn
          </a>
        </nav>

        <button
          type="button"
          className="md:hidden text-[#f4f6fa]"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/[0.06] bg-[#0c1018]/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-[#8b95a8] hover:text-[#f4f6fa]"
              >
                {link.label}
              </a>
            ))}
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#00e5c2]"
            >
              LinkedIn →
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
