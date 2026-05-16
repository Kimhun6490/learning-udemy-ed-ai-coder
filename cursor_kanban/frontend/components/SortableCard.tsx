"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "@/lib/types";

type Props = {
  card: Card;
  onDelete: (id: string) => void;
};

export function SortableCard({ card, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-primary/25 bg-white p-3 shadow-sm outline-none ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-accent ${
        isDragging ? "opacity-50" : ""
      }`}
      data-testid={`card-${card.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className="flex-1 cursor-grab touch-none text-left text-navy active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={`Drag ${card.title}`}
        >
          <h3 className="font-semibold leading-snug">{card.title}</h3>
        </button>
        <button
          type="button"
          className="shrink-0 text-sm text-label underline-offset-2 hover:underline"
          onClick={() => onDelete(card.id)}
          data-testid={`delete-card-${card.id}`}
        >
          Delete
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-label">{card.details}</p>
    </article>
  );
}
