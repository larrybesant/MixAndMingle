import { test, expect } from "@playwright/test";

test("User can log in", async ({ page }) => {
  await page.goto("/demo-login");
  await page.fill('input[type="email"]', "testuser@example.com");
  await page.fill('input[type="password"]', "TestPassword123!");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard|demo-dashboard/);
});
