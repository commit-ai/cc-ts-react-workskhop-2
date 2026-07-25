import { test, expect } from '@playwright/test';

test.describe('Hero table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders with at least one hero row', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('search filters the visible rows', async ({ page }) => {
    const allRows = page.locator('table tbody tr');
    await expect(allRows.first()).toBeVisible();
    const totalBefore = await allRows.count();

    await page.getByPlaceholder('Search heroes...').fill('batman');

    await expect(allRows).toHaveCount(1);
    await expect(page.getByRole('cell', { name: 'Batman' }).first()).toBeVisible();
    expect(await allRows.count()).toBeLessThan(totalBefore);
  });

  test('selecting two heroes and clicking Compare navigates to compare view', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();

    // Select first two heroes via their row checkboxes
    await rows.nth(0).locator('input[type="checkbox"]').check();
    await rows.nth(1).locator('input[type="checkbox"]').check();

    const compareBtn = page.getByRole('button', { name: /compare/i });
    await expect(compareBtn).toBeVisible();
    await compareBtn.click();

    // Compare view shows a Back button; the search input is gone
    await expect(page.getByRole('button', { name: /back/i })).toBeVisible();
    await expect(page.getByPlaceholder('Search heroes...')).not.toBeVisible();
  });
});

test.describe('Compare view', () => {
  test('shows both selected hero names', async ({ page }) => {
    await page.goto('/');

    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();

    // Grab the names of the first two heroes before clicking
    const nameA = await rows.nth(0).locator('td').nth(2).innerText();
    const nameB = await rows.nth(1).locator('td').nth(2).innerText();

    await rows.nth(0).locator('input[type="checkbox"]').check();
    await rows.nth(1).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /compare/i }).click();

    // Both hero names should appear in the compare view
    await expect(page.getByText(nameA).first()).toBeVisible();
    await expect(page.getByText(nameB).first()).toBeVisible();
  });
});
