import { arrayMove } from "@dnd-kit/sortable";
import type { Card } from "./types";

export function orderedCardIdsForColumn(cards: Card[], columnId: string): string[] {
  return cards
    .filter((c) => c.columnId === columnId)
    .sort((a, b) => a.order - b.order)
    .map((c) => c.id);
}

export function reorderCardsAfterDrop(
  cards: Card[],
  activeId: string,
  overId: string,
  columnIds: string[],
): Card[] | null {
  if (activeId === overId) return null;

  const activeCard = cards.find((c) => c.id === activeId);
  if (!activeCard) return null;

  const overIsColumn = columnIds.includes(overId);
  const overCard = overIsColumn ? undefined : cards.find((c) => c.id === overId);
  if (!overIsColumn && !overCard) return null;

  const targetColumnId = overIsColumn ? overId : overCard!.columnId;
  const sourceColumnId = activeCard.columnId;

  if (sourceColumnId === targetColumnId) {
    const ids = orderedCardIdsForColumn(cards, sourceColumnId);
    const oldIndex = ids.indexOf(activeId);
    let newIndex: number;
    if (overIsColumn) {
      newIndex = ids.length - 1;
    } else {
      newIndex = ids.indexOf(overId);
    }
    if (oldIndex < 0 || newIndex < 0) return null;
    if (oldIndex === newIndex) return null;
    const newIds = arrayMove(ids, oldIndex, newIndex);
    return applyColumnOrder(cards, sourceColumnId, newIds);
  }

  const sourceIds = orderedCardIdsForColumn(
    cards.filter((c) => c.id !== activeId),
    sourceColumnId,
  );

  const targetBase = cards
    .filter((c) => c.columnId === targetColumnId && c.id !== activeId)
    .sort((a, b) => a.order - b.order)
    .map((c) => c.id);

  let insertIndex: number;
  if (overIsColumn) {
    insertIndex = targetBase.length;
  } else {
    insertIndex = targetBase.indexOf(overId);
    if (insertIndex < 0) insertIndex = targetBase.length;
  }

  const targetIds = [
    ...targetBase.slice(0, insertIndex),
    activeId,
    ...targetBase.slice(insertIndex),
  ];

  let next = cards.map((c) =>
    c.id === activeId ? { ...c, columnId: targetColumnId } : { ...c },
  );
  next = applyColumnOrder(next, sourceColumnId, sourceIds);
  next = applyColumnOrder(next, targetColumnId, targetIds);
  return next;
}

export function applyColumnOrder(cards: Card[], columnId: string, orderedIds: string[]): Card[] {
  const orderMap = new Map(orderedIds.map((id, i) => [id, i]));
  return cards.map((c) => {
    if (c.columnId !== columnId) return c;
    const order = orderMap.get(c.id);
    if (order === undefined) return c;
    return { ...c, order };
  });
}

export function addCard(
  cards: Card[],
  columnId: string,
  title: string,
  details: string,
  newId: string,
): Card[] {
  const inCol = cards.filter((c) => c.columnId === columnId);
  const nextOrder = inCol.length === 0 ? 0 : Math.max(...inCol.map((c) => c.order)) + 1;
  return [...cards, { id: newId, columnId, title, details, order: nextOrder }];
}

export function deleteCard(cards: Card[], cardId: string): Card[] {
  const removed = cards.filter((c) => c.id !== cardId);
  const colId = cards.find((c) => c.id === cardId)?.columnId;
  if (!colId) return removed;
  const ids = orderedCardIdsForColumn(removed, colId);
  return applyColumnOrder(removed, colId, ids);
}

export function renameColumn<T extends { id: string; title: string }>(
  columns: T[],
  columnId: string,
  title: string,
): T[] {
  return columns.map((c) => (c.id === columnId ? { ...c, title } : c));
}
