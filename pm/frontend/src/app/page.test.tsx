import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import { AUTH_STORAGE_KEY } from "@/lib/auth";
import { initialData } from "@/lib/kanban";
import { afterEach, beforeEach, vi } from "vitest";

const makeBoard = () => JSON.parse(JSON.stringify(initialData));

describe("Home auth gate", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes("/api/board") && (!init || init.method === undefined || init.method === "GET")) {
        return new Response(JSON.stringify({ board: makeBoard() }), { status: 200 });
      }
      if (url.includes("/api/board") && init?.method === "PUT") {
        return new Response(init.body?.toString(), { status: 200 });
      }
      if (url.includes("/api/ai/chat")) {
        return new Response(
          JSON.stringify({ assistantMessage: "Done", boardUpdated: false }),
          { status: 200 }
        );
      }
      return new Response("not found", { status: 404 });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows login form when unauthenticated", async () => {
    render(<Home />);

    expect(await screen.findByRole("heading", { name: /project management mvp/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /kanban studio/i })).not.toBeInTheDocument();
  });

  it("rejects invalid credentials", async () => {
    render(<Home />);

    await userEvent.type(await screen.findByLabelText(/username/i), "bad");
    await userEvent.type(screen.getByLabelText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /kanban studio/i })).not.toBeInTheDocument();
  });

  it("logs in with demo credentials and supports logout", async () => {
    render(<Home />);

    await userEvent.type(await screen.findByLabelText(/username/i), "user");
    await userEvent.type(screen.getByLabelText(/password/i), "password");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByRole("heading", { name: /kanban studio/i })).toBeInTheDocument();
    expect(window.sessionStorage.getItem(AUTH_STORAGE_KEY)).toBe("1");

    await userEvent.click(screen.getByRole("button", { name: /log out/i }));

    expect(await screen.findByRole("heading", { name: /project management mvp/i })).toBeInTheDocument();
    expect(window.sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
