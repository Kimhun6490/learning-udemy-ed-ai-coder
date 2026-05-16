import { expect, test } from "@playwright/test";

test.describe("Kanban board", () => {
  test("loads five columns and seeded cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("column-c1")).toBeVisible();
    await expect(page.getByTestId("column-c5")).toBeVisible();
    await expect(page.getByText("Design board layout")).toBeVisible();
  });

  test("renames a column", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("column-title-c2").click();
    const input = page.getByLabel("Edit column title");
    await input.fill("Selected");
    await input.press("Enter");
    await expect(page.getByTestId("column-title-c2")).toHaveText("Selected");
  });

  test("adds and deletes a card", async ({ page }) => {
    await page.goto("/");
    const addBtn = page.getByTestId("add-card-open-c1");
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click();
    const titleInput = page.getByTestId("new-card-title-c1");
    await expect(titleInput).toBeVisible();
    await titleInput.fill("Playwright card");
    await page.getByTestId("new-card-details-c1").fill("Created in E2E");
    await page.getByTestId("submit-new-card-c1").click();
    const col = page.getByTestId("column-c1");
    const added = col.locator("article").filter({ hasText: "Playwright card" });
    await expect(added).toBeVisible();
    await added.getByRole("button", { name: "Delete" }).click();
    await expect(added).toHaveCount(0);
  });

  test("drags a card into another column", async ({ page }) => {
    await page.goto("/");
    const card = page.getByTestId("card-card-2");
    const dragHandle = card.getByRole("button", { name: /Drag Pick drag-and-drop library/i });
    const target = page.getByTestId("column-c3");
    await dragHandle.scrollIntoViewIfNeeded();
    await target.scrollIntoViewIfNeeded();
    const from = await dragHandle.boundingBox();
    const to = await target.boundingBox();
    expect(from).toBeTruthy();
    expect(to).toBeTruthy();
    await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
    await page.mouse.down();
    await page.mouse.move(to!.x + to!.width / 2, to!.y + 48, { steps: 30 });
    await page.mouse.up();
    await expect(target.getByText("Pick drag-and-drop library")).toBeVisible({ timeout: 10000 });
  });
});
