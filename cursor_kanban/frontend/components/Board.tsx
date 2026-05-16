"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import {
  addCard,
  deleteCard,
  reorderCardsAfterDrop,
  renameColumn,
} from "@/lib/boardState";
import { initialCards, initialColumns } from "@/lib/initialBoard";
import type { Card } from "@/lib/types";
import { BoardColumn } from "./BoardColumn";

function CardPreview({ card }: { card: Card }) {
  return (
    <div className="w-72 rounded-lg border border-primary/25 bg-white p-3 shadow-lg">
      <h3 className="font-semibold text-navy">{card.title}</h3>
      <p className="mt-2 text-sm text-label">{card.details}</p>
    </div>
  );
}

export function Board() {
  const [columns, setColumns] = useState(initialColumns);
  const [cards, setCards] = useState(initialCards);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const columnIds = columns.map((c) => c.id);
  const activeCard = activeId ? cards.find((c) => c.id === activeId) : undefined;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    setCards((prev) =>
      reorderCardsAfterDrop(prev, String(active.id), String(over.id), columnIds) ??
      prev,
    );
  }

  function handleAddCard(columnId: string, title: string, details: string) {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `card-${crypto.randomUUID()}`
        : `card-${Date.now()}`;
    setCards((prev) => addCard(prev, columnId, title, details, id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-1 flex-col px-4 pb-8 pt-6 md:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-navy md:text-3xl">
          Project board
        </h1>
        <p className="mt-1 text-sm text-label">Single board, in-memory. Drag cards between columns.</p>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              cards={cards}
              onAddCard={handleAddCard}
              onDeleteCard={(cardId) => setCards((prev) => deleteCard(prev, cardId))}
              onRenameColumn={(columnId, title) =>
                setColumns((prev) => renameColumn(prev, columnId, title))
              }
            />
          ))}
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeCard ? <CardPreview card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
