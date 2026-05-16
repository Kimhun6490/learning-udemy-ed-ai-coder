"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import type { Card, Column } from "@/lib/types";
import { orderedCardIdsForColumn } from "@/lib/boardState";
import { SortableCard } from "./SortableCard";

type Props = {
  column: Column;
  cards: Card[];
  onAddCard: (columnId: string, title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
};

export function BoardColumn({
  column,
  cards: allCards,
  onAddCard,
  onDeleteCard,
  onRenameColumn,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const columnCards = allCards
    .filter((c) => c.columnId === column.id)
    .sort((a, b) => a.order - b.order);
  const sortableIds = orderedCardIdsForColumn(allCards, column.id);

  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(column.title);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");

  function commitRename() {
    const t = draftTitle.trim();
    if (t) onRenameColumn(column.id, t);
    setEditing(false);
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    onAddCard(column.id, title, newDetails.trim());
    setNewTitle("");
    setNewDetails("");
    setShowAdd(false);
  }

  return (
    <section
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-xl border-t-4 border-accent bg-white/95 shadow-md ring-primary/30 backdrop-blur-sm transition-shadow ${
        isOver ? "ring-2" : ""
      }`}
      data-testid={`column-${column.id}`}
      aria-label={`Column ${column.title}`}
    >
      <header className="border-b border-primary/15 px-3 py-3">
        {editing ? (
          <input
            className="w-full rounded-md border border-primary/40 px-2 py-1.5 text-navy outline-none focus-visible:ring-2 focus-visible:ring-accent"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
            }}
            autoFocus
            aria-label="Edit column title"
          />
        ) : (
          <button
            type="button"
            className="w-full rounded-md px-1 text-left text-lg font-semibold text-navy hover:bg-primary/5"
            onClick={() => {
              setDraftTitle(column.title);
              setEditing(true);
            }}
            data-testid={`column-title-${column.id}`}
          >
            {column.title}
          </button>
        )}
      </header>

      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-44 flex-1 flex-col gap-2.5 p-2.5">
          {columnCards.map((card) => (
            <SortableCard key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </div>
      </SortableContext>

      <div className="border-t border-primary/10 p-2.5">
        {showAdd ? (
          <form className="flex flex-col gap-2" onSubmit={handleAddSubmit}>
            <input
              className="rounded-md border border-primary/30 px-2 py-1.5 text-sm text-navy outline-none focus-visible:ring-2 focus-visible:ring-accent"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              aria-label="New card title"
              data-testid={`new-card-title-${column.id}`}
            />
            <textarea
              className="min-h-20 resize-y rounded-md border border-primary/30 px-2 py-1.5 text-sm text-navy outline-none focus-visible:ring-2 focus-visible:ring-accent"
              placeholder="Details"
              value={newDetails}
              onChange={(e) => setNewDetails(e.target.value)}
              aria-label="New card details"
              data-testid={`new-card-details-${column.id}`}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-white hover:opacity-95"
                data-testid={`submit-new-card-${column.id}`}
              >
                Add card
              </button>
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-sm text-label hover:bg-black/5"
                onClick={() => {
                  setShowAdd(false);
                  setNewTitle("");
                  setNewDetails("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className="w-full rounded-md bg-secondary py-2 text-sm font-medium text-white hover:opacity-95"
            onClick={() => setShowAdd(true)}
            data-testid={`add-card-open-${column.id}`}
          >
            Add card
          </button>
        )}
      </div>
    </section>
  );
}
