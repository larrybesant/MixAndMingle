import { test, expect } from '@playwright/test';

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/messages',
];

test.describe('Protected Routes', () => {
  for (const route of protectedRoutes) {
    test(`should redirect unauthenticated user from ${route} to login`, async ({ page }) => {
      await page.goto(`http://localhost:3000${route}`);
      await expect(page).toHaveURL(/login/);
    });
  }
});
