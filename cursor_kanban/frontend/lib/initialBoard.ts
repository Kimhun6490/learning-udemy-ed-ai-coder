import type { Card, Column } from "./types";

export const initialColumns: Column[] = [
  { id: "c1", title: "Backlog" },
  { id: "c2", title: "Ready" },
  { id: "c3", title: "In progress" },
  { id: "c4", title: "Review" },
  { id: "c5", title: "Done" },
];

export const initialCards: Card[] = [
  {
    id: "card-1",
    columnId: "c1",
    title: "Design board layout",
    details: "Five columns, horizontal scroll on small viewports, card elevation.",
    order: 0,
  },
  {
    id: "card-2",
    columnId: "c1",
    title: "Pick drag-and-drop library",
    details: "dnd-kit for accessibility and sortable lists.",
    order: 1,
  },
  {
    id: "card-3",
    columnId: "c2",
    title: "Wire column rename",
    details: "Inline edit with blur and Enter to commit.",
    order: 0,
  },
  {
    id: "card-4",
    columnId: "c3",
    title: "Implement card CRUD",
    details: "Add with title and details; delete from card chrome.",
    order: 0,
  },
  {
    id: "card-5",
    columnId: "c3",
    title: "Seed dummy data",
    details: "initialBoard.ts loaded on first paint only.",
    order: 1,
  },
  {
    id: "card-6",
    columnId: "c5",
    title: "Ship MVP",
    details: "Vitest for logic; Playwright for drag flows.",
    order: 0,
  },
];
