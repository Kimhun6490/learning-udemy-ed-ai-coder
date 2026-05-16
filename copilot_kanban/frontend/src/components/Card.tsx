import React from "react";
import type { Card as CardType } from "./KanbanBoard";

interface CardProps {
  card: CardType;
}

export default function Card({ card }: CardProps) {
  return (
    <div className="rounded-xl bg-white dark:bg-zinc-950 shadow-lg p-4 border-l-4 border-[#ecad0a] transition-transform duration-150">
      <div className="font-semibold text-[#753991] mb-1 text-lg leading-tight truncate">{card.title}</div>
      <div className="text-sm text-[#888888] leading-snug">{card.details}</div>
    </div>
  );
}
