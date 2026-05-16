import { expect, test } from "@playwright/test";

test("loads the seeded board", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Kanban Studio" })).toBeVisible();
  await expect(page.getByTestId(/^column-/)).toHaveCount(5);
  await expect(page.getByText("Draft project brief")).toBeVisible();
});

test("adds and deletes a card", async ({ page }) => {
  await page.goto("/");

  const backlog = page.getByTestId("column-backlog");
  await backlog.getByLabel("Card title for Backlog").fill("Ship the demo");
  await backlog
    .getByLabel("Card details for Backlog")
    .fill("Prepare the final walkthrough.");
  await backlog.getByRole("button", { name: "Add card" }).click();

  await expect(page.getByText("Ship the demo")).toBeVisible();
  await page.getByLabel("Delete Ship the demo").click();
  await expect(page.getByText("Ship the demo")).toBeHidden();
});

test("renames a column", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Rename Backlog column").fill("Ideas");

  await expect(page.getByLabel("Rename Ideas column")).toHaveValue("Ideas");
});

test("drags a card between columns", async ({ page }) => {
  await page.goto("/");

  const card = page.getByTestId("card-card-brief");
  const done = page.getByTestId("column-done");
  const cardBox = await card.boundingBox();
  const doneBox = await done.boundingBox();

  expect(cardBox).not.toBeNull();
  expect(doneBox).not.toBeNull();

  await page.mouse.move(
    cardBox!.x + cardBox!.width / 2,
    cardBox!.y + cardBox!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    doneBox!.x + doneBox!.width / 2,
    doneBox!.y + doneBox!.height / 2,
    { steps: 24 },
  );
  await page.mouse.up();

  await expect(done.getByText("Draft project brief")).toBeVisible();
});
