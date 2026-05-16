"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import {
  Board,
  Card,
  addCard,
  deleteCard,
  initialBoard,
  moveCard,
  renameColumn,
} from "@/lib/board";

export function KanbanBoard() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    setBoard((currentBoard) =>
      moveCard(currentBoard, String(active.id), String(over.id)),
    );
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    setBoard((currentBoard) =>
      moveCard(currentBoard, String(active.id), String(over.id)),
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(32,157,215,0.16),transparent_28rem),linear-gradient(180deg,#f9fbff_0%,#eef4f8_100%)] text-[#032147]">
      <section className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="mb-6 flex flex-col gap-4 border-b border-[#032147]/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#209dd7]">
              Project board
            </p>
            <h1 className="text-4xl font-semibold tracking-normal text-[#032147] sm:text-5xl">
              Kanban Studio
            </h1>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-[#032147]/10 bg-white/80 px-4 py-3 shadow-sm">
            <span className="h-3 w-3 rounded-full bg-[#ecad0a]" />
            <span className="text-sm font-medium text-[#888888]">
              {board.reduce((total, column) => total + column.cards.length, 0)}{" "}
              active cards
            </span>
          </div>
        </header>

        <DndContext
          id="kanban-board"
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-5">
            {board.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onRename={(title) =>
                  setBoard((currentBoard) =>
                    renameColumn(currentBoard, column.id, title),
                  )
                }
                onAddCard={(title, details) =>
                  setBoard((currentBoard) =>
                    addCard(currentBoard, column.id, title, details),
                  )
                }
                onDeleteCard={(cardId) =>
                  setBoard((currentBoard) => deleteCard(currentBoard, cardId))
                }
              />
            ))}
          </div>
        </DndContext>
      </section>
    </main>
  );
}

type KanbanColumnProps = {
  column: Board[number];
  onRename: (title: string) => void;
  onAddCard: (title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
};

function KanbanColumn({
  column,
  onRename,
  onAddCard,
  onDeleteCard,
}: KanbanColumnProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !details.trim()) {
      return;
    }

    onAddCard(title, details);
    setTitle("");
    setDetails("");
  }

  return (
    <section
      ref={setNodeRef}
      data-testid={`column-${column.id}`}
      className={`flex min-h-[34rem] flex-col rounded-lg border bg-white/90 shadow-[0_18px_50px_rgba(3,33,71,0.08)] transition ${
        isOver ? "border-[#209dd7] ring-4 ring-[#209dd7]/15" : "border-white"
      }`}
    >
      <div className="border-t-4 border-[#ecad0a] px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3">
          <input
            aria-label={`Rename ${column.title} column`}
            value={column.title}
            onChange={(event) => onRename(event.target.value)}
            className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-lg font-semibold text-[#032147] outline-none transition focus:border-[#209dd7]/40 focus:bg-[#209dd7]/5"
          />
          <span className="rounded-md bg-[#032147]/5 px-2.5 py-1 text-xs font-semibold text-[#888888]">
            {column.cards.length}
          </span>
        </div>
      </div>

      <SortableContext
        items={column.cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
          {column.cards.map((card) => (
            <KanbanCard key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </div>
      </SortableContext>

      <form
        aria-label={`Add card to ${column.title}`}
        onSubmit={handleSubmit}
        className="mt-auto border-t border-[#032147]/10 bg-[#f7fafc] p-4"
      >
        <div className="space-y-2">
          <input
            aria-label={`Card title for ${column.title}`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Card title"
            className="w-full rounded-md border border-[#032147]/10 bg-white px-3 py-2 text-sm font-medium text-[#032147] outline-none transition placeholder:text-[#888888] focus:border-[#209dd7] focus:ring-4 focus:ring-[#209dd7]/10"
          />
          <textarea
            aria-label={`Card details for ${column.title}`}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Details"
            rows={3}
            className="w-full resize-none rounded-md border border-[#032147]/10 bg-white px-3 py-2 text-sm text-[#032147] outline-none transition placeholder:text-[#888888] focus:border-[#209dd7] focus:ring-4 focus:ring-[#209dd7]/10"
          />
        </div>
        <button
          type="submit"
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#753991] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#66327f] focus:outline-none focus:ring-4 focus:ring-[#753991]/20"
        >
          <Plus size={16} aria-hidden="true" />
          Add card
        </button>
      </form>
    </section>
  );
}

type KanbanCardProps = {
  card: Card;
  onDelete: (cardId: string) => void;
};

function KanbanCard({ card, onDelete }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  return (
    <article
      ref={setNodeRef}
      data-testid={`card-${card.id}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`group rounded-lg border border-[#032147]/10 bg-white p-4 shadow-sm transition ${
        isDragging
          ? "z-10 scale-[1.02] border-[#209dd7] shadow-xl"
          : "hover:-translate-y-0.5 hover:shadow-md"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold leading-6 text-[#032147]">
          {card.title}
        </h2>
        <button
          type="button"
          aria-label={`Delete ${card.title}`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onDelete(card.id)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#888888] opacity-80 transition hover:bg-[#753991]/10 hover:text-[#753991] focus:outline-none focus:ring-4 focus:ring-[#753991]/15 group-hover:opacity-100"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
      <p className="text-sm leading-6 text-[#888888]">{card.details}</p>
    </article>
  );
}
