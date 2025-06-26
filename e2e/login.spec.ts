import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should show error for invalid login', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[name="email"]');
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"], .error')).toHaveText(/invalid|error|incorrect/i);
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[name="email"]');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard|home|profile|create-profile/i);
  });
});
