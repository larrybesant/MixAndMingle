import { test, expect } from "@playwright/test";

test("Dashboard loads and displays user info", async ({ page }) => {
  // Log in first
  await page.goto("/login");
  await page.fill('input[type="email"]', "testuser@example.com");
  await page.fill('input[type="password"]', "TestPassword123!");
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);
  // Now check dashboard content
  await expect(page.locator('h1[role="heading"]')).toContainText(
    "Welcome back",
  );
  await expect(page.locator("text=Profile Completion")).toBeVisible();
  await expect(page.locator("text=Quick Actions")).toBeVisible();
});
