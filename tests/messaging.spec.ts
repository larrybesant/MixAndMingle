import { test, expect } from '@playwright/test';

test.describe('Messaging', () => {
  test('should require login to access direct chat', async ({ page }) => {
    await page.goto('http://localhost:3000/messages/1');
    await expect(page).toHaveURL(/login/);
  });

  test('should send a message after login', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/login/);
    await page.goto('http://localhost:3000/messages/2'); // Use a valid userId for testing
    await page.fill('input[name="chat-input"]', 'Hello from Playwright!');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Hello from Playwright!')).toBeVisible();
  });
});

// Moved to e2e/messaging.spec.ts
