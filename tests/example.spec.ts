import { test, expect } from "@playwright/test"

// example.spec.ts
test("Example Visual Regression Testing", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/")
  await expect(page).toHaveScreenshot()
})
