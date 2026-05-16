import { describe, expect, it } from "vitest";
import { Board, moveCard } from "./board";

const board: Board = [
  {
    id: "todo",
    title: "Todo",
    cards: [
      { id: "a", title: "A", details: "Alpha" },
      { id: "b", title: "B", details: "Beta" },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "c", title: "C", details: "Gamma" }],
  },
];

describe("moveCard", () => {
  it("moves a card between columns", () => {
    const result = moveCard(board, "a", "done");

    expect(result[0].cards.map((card) => card.id)).toEqual(["b"]);
    expect(result[1].cards.map((card) => card.id)).toEqual(["c", "a"]);
  });

  it("reorders cards in the same column", () => {
    const result = moveCard(board, "b", "a");

    expect(result[0].cards.map((card) => card.id)).toEqual(["b", "a"]);
    expect(result[1].cards.map((card) => card.id)).toEqual(["c"]);
  });
});
