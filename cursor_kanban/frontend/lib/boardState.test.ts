import { describe, expect, it } from "vitest";
import {
  addCard,
  applyColumnOrder,
  deleteCard,
  orderedCardIdsForColumn,
  reorderCardsAfterDrop,
  renameColumn,
} from "./boardState";
import type { Card } from "./types";

const columnIds = ["c1", "c2", "c3", "c4", "c5"];

const baseCards: Card[] = [
  { id: "a", columnId: "c1", title: "A", details: "", order: 0 },
  { id: "b", columnId: "c1", title: "B", details: "", order: 1 },
  { id: "x", columnId: "c2", title: "X", details: "", order: 0 },
];

describe("orderedCardIdsForColumn", () => {
  it("returns ids sorted by order", () => {
    expect(orderedCardIdsForColumn(baseCards, "c1")).toEqual(["a", "b"]);
    expect(orderedCardIdsForColumn(baseCards, "c2")).toEqual(["x"]);
  });
});

describe("reorderCardsAfterDrop", () => {
  it("reorders within the same column", () => {
    const next = reorderCardsAfterDrop(baseCards, "b", "a", columnIds);
    expect(next).not.toBeNull();
    const orders = next!
      .filter((c) => c.columnId === "c1")
      .sort((p, q) => p.order - q.order)
      .map((c) => c.id);
    expect(orders).toEqual(["b", "a"]);
  });

  it("moves a card to another column before a target card", () => {
    const next = reorderCardsAfterDrop(baseCards, "a", "x", columnIds);
    expect(next).not.toBeNull();
    const c2 = next!.filter((c) => c.columnId === "c2").sort((p, q) => p.order - q.order);
    expect(c2.map((c) => c.id)).toEqual(["a", "x"]);
    const c1 = next!.filter((c) => c.columnId === "c1").sort((p, q) => p.order - q.order);
    expect(c1.map((c) => c.id)).toEqual(["b"]);
  });

  it("appends to a column when dropped on the column id", () => {
    const next = reorderCardsAfterDrop(baseCards, "a", "c2", columnIds);
    expect(next).not.toBeNull();
    const c2 = next!.filter((c) => c.columnId === "c2").sort((p, q) => p.order - q.order);
    expect(c2.map((c) => c.id)).toEqual(["x", "a"]);
  });

  it("returns null when no change", () => {
    expect(reorderCardsAfterDrop(baseCards, "a", "a", columnIds)).toBeNull();
  });
});

describe("addCard", () => {
  it("appends with next order in column", () => {
    const next = addCard(baseCards, "c2", "Y", "d", "new");
    const c2 = next.filter((c) => c.columnId === "c2").sort((p, q) => p.order - q.order);
    expect(c2.map((c) => ({ id: c.id, order: c.order }))).toEqual([
      { id: "x", order: 0 },
      { id: "new", order: 1 },
    ]);
  });
});

describe("deleteCard", () => {
  it("removes card and compacts orders", () => {
    const next = deleteCard(baseCards, "a");
    const c1 = next.filter((c) => c.columnId === "c1").sort((p, q) => p.order - q.order);
    expect(c1.map((c) => ({ id: c.id, order: c.order }))).toEqual([{ id: "b", order: 0 }]);
  });
});

describe("applyColumnOrder", () => {
  it("assigns order indices", () => {
    const cards: Card[] = [
      { id: "p", columnId: "c1", title: "", details: "", order: 9 },
      { id: "q", columnId: "c1", title: "", details: "", order: 8 },
    ];
    const next = applyColumnOrder(cards, "c1", ["q", "p"]);
    expect(next.find((c) => c.id === "q")!.order).toBe(0);
    expect(next.find((c) => c.id === "p")!.order).toBe(1);
  });
});

describe("renameColumn", () => {
  it("updates title for matching id", () => {
    const cols = [
      { id: "c1", title: "Old" },
      { id: "c2", title: "Two" },
    ];
    expect(renameColumn(cols, "c1", "New")).toEqual([
      { id: "c1", title: "New" },
      { id: "c2", title: "Two" },
    ]);
  });
});
