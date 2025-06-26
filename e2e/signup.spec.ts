import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test('should show error for invalid signup', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    await page.waitForSelector('input[name="email"]');
    await page.fill('input[name="email"]', 'bademail');
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"], .error')).toHaveText(/invalid|error|weak|required/i);
  });

  test('should signup with valid credentials', async ({ page }) => {
    const uniqueEmail = `testuser+${Date.now()}@example.com`;
    await page.goto('http://localhost:3000/signup');
    await page.waitForSelector('input[name="email"]');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/verify|dashboard|home|profile|signup\/check-email/i);
  });
});
