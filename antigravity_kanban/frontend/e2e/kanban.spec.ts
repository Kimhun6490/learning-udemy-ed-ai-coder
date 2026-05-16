import { test, expect } from '@playwright/test';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main board and default columns', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Project Alpha');
    
    // Check for default columns
    const columns = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
    for (const column of columns) {
      await expect(page.locator(`input[value="${column}"]`)).toBeVisible();
    }
  });

  test('should allow adding a new card to a column', async ({ page }) => {
    // Add card to Backlog (col-1)
    const addCardBtn = page.getByTestId('add-card-btn-col-1');
    await addCardBtn.click();

    // Fill the card form
    await page.getByPlaceholder('Card Title').fill('E2E Test Card');
    await page.getByPlaceholder('Card Details (optional)').fill('This is an E2E test detail');
    
    // Submit
    const col1 = page.getByTestId('column-col-1');
    await col1.getByRole('button', { name: 'Add', exact: true }).click();

    // Verify card is added
    await expect(page.getByText('E2E Test Card')).toBeVisible();
    await expect(page.getByText('This is an E2E test detail')).toBeVisible();
  });

  test('should allow deleting a card', async ({ page }) => {
    // We expect "Research competitors" to be a pre-populated card
    const cardTitle = 'Research competitors';
    await expect(page.getByText(cardTitle)).toBeVisible();

    // Find the delete button for card-1
    const deleteBtn = page.getByTestId('delete-card-card-1');
    
    // Force click since the button is only visible on hover
    await deleteBtn.click({ force: true });

    // Verify card is removed
    await expect(page.getByText(cardTitle)).not.toBeVisible();
  });

  test('should allow renaming a column', async ({ page }) => {
    const columnInput = page.getByLabel('Rename To Do column');
    await expect(columnInput).toBeVisible();

    // Change title
    await columnInput.fill('Next Up');
    
    // Trigger blur or enter to save
    await columnInput.press('Enter');

    // Verify new title is present
    await expect(page.locator('input[value="Next Up"]')).toBeVisible();
  });
});
