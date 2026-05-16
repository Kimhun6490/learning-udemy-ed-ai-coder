"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import React, { useState } from "react";
import Column from "./Column";

// Dummy data for initial board state
const initialColumns = [
  { id: "col-1", name: "Backlog", cards: [
    { id: "card-1", title: "Welcome!", details: "This is your Kanban MVP." },
    { id: "card-2", title: "Try drag & drop", details: "Move cards between columns." }
  ] },
  { id: "col-2", name: "To Do", cards: [] },
  { id: "col-3", name: "In Progress", cards: [] },
  { id: "col-4", name: "Review", cards: [] },
  { id: "col-5", name: "Done", cards: [] },
];

export type Card = { id: string; title: string; details: string };
export type ColumnType = { id: string; name: string; cards: Card[] };

export default function KanbanBoard() {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);

  // Handle drag end
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;

    // Card drag
    if (type === "CARD") {
      const sourceColIdx = source.droppableId.split("col-")[1] - 1;
      const destColIdx = destination.droppableId.split("col-")[1] - 1;
      const sourceCol = columns[sourceColIdx];
      const destCol = columns[destColIdx];
      const card = sourceCol.cards[source.index];

      // Remove from source
      const newSourceCards = [...sourceCol.cards];
      newSourceCards.splice(source.index, 1);
      // Insert into dest
      const newDestCards = [...destCol.cards];
      newDestCards.splice(destination.index, 0, card);

      const newColumns = [...columns];
      newColumns[sourceColIdx] = { ...sourceCol, cards: newSourceCards };
      newColumns[destColIdx] = { ...destCol, cards: newDestCards };
      setColumns(newColumns);
    }
  };

  return (
    <div className="w-full max-w-6xl p-6 rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 flex flex-col gap-6 border border-zinc-200 dark:border-zinc-800">
      <h1 className="text-4xl font-extrabold mb-4 text-[#032147] tracking-tight">Kanban Board</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-2">
          {columns.map((col, idx) => (
            <Droppable droppableId={`col-${idx+1}`} key={col.id} type="CARD">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`transition-shadow duration-200 flex flex-col bg-[#f8fafc] dark:bg-zinc-800 rounded-xl p-4 min-w-[280px] max-w-xs border border-zinc-200 dark:border-zinc-700 shadow-md ${snapshot.isDraggingOver ? "ring-4 ring-[#209dd7]/30" : ""}`}
                >
                  <Column column={col} columnIndex={idx} DraggableComponent={Draggable} />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
