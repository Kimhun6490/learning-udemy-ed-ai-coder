import { profile } from "@/data/profile";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-[#8b95a8] sm:flex-row lg:px-8">
        <p>
          © {year}{" "}
          <span className="text-[#f4f6fa]">{profile.name}</span>. All rights
          reserved.
        </p>
        <p className="font-[family-name:var(--font-jetbrains)] text-xs">
          Built with Next.js
        </p>
      </div>
    </footer>
  );
}
