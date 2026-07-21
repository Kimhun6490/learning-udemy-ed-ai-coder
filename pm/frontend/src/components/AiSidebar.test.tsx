import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AiSidebar } from "@/components/AiSidebar";
import * as api from "@/lib/api";

describe("AiSidebar", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends a message and renders assistant response", async () => {
    const onBoardUpdated = vi.fn();
    vi.spyOn(api, "sendAiChat").mockResolvedValue({
      assistantMessage: "Moved the card.",
      boardUpdated: true,
    });

    render(<AiSidebar onBoardUpdated={onBoardUpdated} />);

    await userEvent.type(
      screen.getByPlaceholderText(/ask ai to update the board/i),
      "Move card to done"
    );
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByText("Moved the card.")).toBeInTheDocument();
    expect(onBoardUpdated).toHaveBeenCalledTimes(1);
  });
});
