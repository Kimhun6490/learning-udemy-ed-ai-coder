import { expect, test, type Page } from "@playwright/test";

const makeBoard = () => ({
  columns: [
    { id: "col-backlog", title: "Backlog", cardIds: ["card-1", "card-2"] },
    { id: "col-discovery", title: "Discovery", cardIds: ["card-3"] },
    { id: "col-progress", title: "In Progress", cardIds: ["card-4", "card-5"] },
    { id: "col-review", title: "Review", cardIds: ["card-6"] },
    { id: "col-done", title: "Done", cardIds: ["card-7", "card-8"] },
  ],
  cards: {
    "card-1": { id: "card-1", title: "Align roadmap themes", details: "Draft quarterly themes." },
    "card-2": { id: "card-2", title: "Gather customer signals", details: "Review support tags." },
    "card-3": { id: "card-3", title: "Prototype analytics view", details: "Sketch dashboards." },
    "card-4": { id: "card-4", title: "Refine status language", details: "Standardize labels." },
    "card-5": { id: "card-5", title: "Design card layout", details: "Improve hierarchy." },
    "card-6": { id: "card-6", title: "QA micro-interactions", details: "Verify states." },
    "card-7": { id: "card-7", title: "Ship marketing page", details: "Final copy approved." },
    "card-8": { id: "card-8", title: "Close onboarding sprint", details: "Share release notes." },
  },
});

const installApiMocks = async (
  page: Page,
  options: { aiUpdatesBoard?: boolean } = {}
) => {
  let board = makeBoard();

  await page.route("**/api/board", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ board }),
      });
      return;
    }

    if (method === "PUT") {
      const payload = route.request().postDataJSON() as { board: typeof board };
      board = payload.board;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ board }),
      });
      return;
    }

    await route.fulfill({ status: 404, body: "not found" });
  });

  await page.route("**/api/ai/chat", async (route) => {
    if (options.aiUpdatesBoard) {
      board = {
        ...board,
        columns: board.columns.map((column) =>
          column.id === "col-backlog" ? { ...column, title: "AI Backlog" } : column
        ),
      };
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        assistantMessage: "Done",
        boardUpdated: Boolean(options.aiUpdatesBoard),
      }),
    });
  });
};

const login = async (page: Page, options: { aiUpdatesBoard?: boolean } = {}) => {
  await installApiMocks(page, options);
  await page.goto("/");
  await page.getByLabel("Username").fill("user");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: /log in/i }).click();
};

test("requires login and supports logout", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /project management mvp/i })).toBeVisible();

  await login(page);
  await expect(page.getByRole("heading", { name: "Kanban Studio" })).toBeVisible();
  await expect(page.locator('[data-testid^="column-"]')).toHaveCount(5);

  await page.getByRole("button", { name: /log out/i }).click();
  await expect(page.getByRole("heading", { name: /project management mvp/i })).toBeVisible();
});

test("adds a card to a column", async ({ page }) => {
  await login(page);
  const firstColumn = page.locator('[data-testid^="column-"]').first();
  await firstColumn.getByRole("button", { name: /add a card/i }).click();
  await firstColumn.getByPlaceholder("Card title").fill("Playwright card");
  await firstColumn.getByPlaceholder("Details").fill("Added via e2e.");
  await firstColumn.getByRole("button", { name: /add card/i }).click();
  await expect(firstColumn.getByText("Playwright card")).toBeVisible();
});

test("moves a card between columns", async ({ page }) => {
  await login(page);
  const card = page.getByTestId("card-card-1");
  const targetColumn = page.getByTestId("column-col-review");
  const cardBox = await card.boundingBox();
  const columnBox = await targetColumn.boundingBox();
  if (!cardBox || !columnBox) {
    throw new Error("Unable to resolve drag coordinates.");
  }

  await page.mouse.move(
    cardBox.x + cardBox.width / 2,
    cardBox.y + cardBox.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(
    columnBox.x + columnBox.width / 2,
    columnBox.y + 120,
    { steps: 12 }
  );
  await page.mouse.up();
  await expect(targetColumn.getByTestId("card-card-1")).toBeVisible();
});

test("refreshes board after AI update", async ({ page }) => {
  await login(page, { aiUpdatesBoard: true });

  await expect(page.getByLabel("Column title").first()).toHaveValue("Backlog");

  await page.getByPlaceholder("Ask AI to update the board...").fill("Rename backlog");
  await page.getByRole("button", { name: /^send$/i }).click();

  await expect(page.getByLabel("Column title").first()).toHaveValue("AI Backlog");
});
