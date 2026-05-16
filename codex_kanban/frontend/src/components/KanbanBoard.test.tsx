import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { KanbanBoard } from "./KanbanBoard";

describe("KanbanBoard", () => {
  it("renders the dummy board with five columns", () => {
    render(<KanbanBoard />);

    expect(screen.getByRole("heading", { name: "Kanban Studio" })).toBeVisible();
    expect(screen.getAllByTestId(/^column-/)).toHaveLength(5);
    expect(screen.getByText("Draft project brief")).toBeVisible();
  });

  it("renames a column", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const input = screen.getByLabelText("Rename Backlog column");
    await user.clear(input);
    await user.type(input, "Ideas");

    expect(screen.getByDisplayValue("Ideas")).toBeVisible();
  });

  it("adds a card to a column", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const backlog = screen.getByTestId("column-backlog");
    await user.type(
      within(backlog).getByLabelText("Card title for Backlog"),
      "Plan launch",
    );
    await user.type(
      within(backlog).getByLabelText("Card details for Backlog"),
      "Confirm the final launch checklist.",
    );
    await user.click(within(backlog).getByRole("button", { name: "Add card" }));

    expect(screen.getByText("Plan launch")).toBeVisible();
    expect(screen.getByText("Confirm the final launch checklist.")).toBeVisible();
  });

  it("deletes an existing card", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    await user.click(screen.getByLabelText("Delete Draft project brief"));

    expect(screen.queryByText("Draft project brief")).not.toBeInTheDocument();
    expect(screen.getByText("Review customer notes")).toBeVisible();
  });
});
