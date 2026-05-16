import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Board } from "@/components/Board";

describe("Board", () => {
  it("renders five columns from seed data", () => {
    render(<Board />);
    expect(screen.getByTestId("column-c1")).toBeInTheDocument();
    expect(screen.getByTestId("column-c5")).toBeInTheDocument();
  });

  it("renames a column from the title control", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByTestId("column-title-c1"));
    const input = screen.getByLabelText("Edit column title");
    await user.clear(input);
    await user.type(input, "Icebox");
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("column-title-c1")).toHaveTextContent("Icebox");
  });

  it("adds a card to a column", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByTestId("add-card-open-c5"));
    await user.type(screen.getByTestId("new-card-title-c5"), "E2E later");
    await user.type(screen.getByTestId("new-card-details-c5"), "Details text");
    await user.click(screen.getByTestId("submit-new-card-c5"));
    const col = screen.getByTestId("column-c5");
    expect(within(col).getByText("E2E later")).toBeInTheDocument();
  });

  it("deletes a card", async () => {
    const user = userEvent.setup();
    render(<Board />);
    const card = screen.getByTestId("card-card-6");
    expect(card).toBeInTheDocument();
    await user.click(screen.getByTestId("delete-card-card-6"));
    expect(screen.queryByTestId("card-card-6")).not.toBeInTheDocument();
  });
});
