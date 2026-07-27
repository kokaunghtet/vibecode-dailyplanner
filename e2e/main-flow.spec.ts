import { test, expect } from '@playwright/test';

const EMAIL = process.env.E2E_EMAIL!;
const PASSWORD = process.env.E2E_PASSWORD!;

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(EMAIL);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/');
});

test('add, complete, delete, and undo a task', async ({ page }) => {
  const text = `e2e task ${Date.now()}`;
  await page.getByPlaceholder('Add a task...').fill(text);
  await page.getByRole('button', { name: 'Add' }).click();

  const row = page.locator('div.group', { hasText: text });
  await expect(row).toBeVisible();

  await row.getByRole('checkbox').click({ force: true });
  await expect(row.locator('span')).toHaveClass(/line-through/);

  await row.getByRole('button', { name: 'Delete todo' }).click();
  await expect(page.getByText('Task deleted')).toBeVisible();

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByText('Task deleted')).not.toBeVisible();
  await expect(page.locator('div.group', { hasText: text })).toBeVisible();
});

test('calendar navigation works', async ({ page }) => {
  await page.getByRole('link', { name: 'View Calendar' }).click();
  await expect(page).toHaveURL('/calendar');
});
