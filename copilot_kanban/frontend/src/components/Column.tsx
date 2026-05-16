import React from "react";
import type { ColumnType } from "./KanbanBoard";
import Card from "./Card";

interface ColumnProps {
  column: ColumnType;
  columnIndex: number;
  DraggableComponent: any;
}

export default function Column({ column, columnIndex, DraggableComponent }: ColumnProps) {
  return (
    <>
      <input
        className="font-semibold text-xl mb-4 px-2 py-1 rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#209dd7] text-[#209dd7] text-center"
        value={column.name}
        readOnly
        placeholder="Column name"
        title="Column name"
        aria-label="Column name"
      />
      <div className="flex flex-col gap-4">
        {column.cards.map((card, idx) => (
          <DraggableComponent draggableId={card.id} index={idx} key={card.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`mb-2 ${snapshot.isDragging ? "scale-105 z-10" : ""}`}
              >
                <Card card={card} />
              </div>
            )}
          </DraggableComponent>
        ))}
      </div>
    </>
  );
}
