import { test, expect } from "@playwright/test";

test("User can sign up", async ({ page }) => {
  await page.goto("/signup");
  await page.fill('input[placeholder*="Username"]', "testuser123");
  await page.fill('input[type="email"]', "testuser@example.com");
  await page.fill('input[type="password"]', "TestPassword123!");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard|profile-setup/);
});
