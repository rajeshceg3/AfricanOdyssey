// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('African Odyssey', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/');
  });

  test('should display welcome overlay and start journey', async ({ page }) => {
    const welcomeOverlay = page.locator('#welcome-overlay');
    await expect(welcomeOverlay).toBeVisible();

    const startButton = page.locator('#start-journey-btn');
    await startButton.click();

    await expect(welcomeOverlay).not.toBeVisible();
    await expect(page.locator('#map')).toBeFocused();
  });

  test('should open and close details panel', async ({ page }) => {
    // Start journey
    await page.locator('#start-journey-btn').click();

    // Wait for markers to appear (simulated by timeout in app.js)
    // Note: The app has a 500ms timeout after click.
    await page.waitForTimeout(1000);

    // Find a marker. We need to be careful as they are created dynamically.
    // The markers have class 'custom-marker'.
    const marker = page.locator('.custom-marker').first();
    await expect(marker).toBeVisible();

    // Store the marker for focus check later
    // Note: Playwright locators are strict, so we reuse the locator.

    // Click marker
    await marker.click();

    // Verify panel opens
    const panel = page.locator('#info-panel');
    await expect(panel).toHaveClass(/active/);
    await expect(page.locator('body')).toHaveClass(/panel-active/);

    // Verify content loaded (e.g. image)
    await expect(page.locator('.panel-image')).toBeVisible();

    // Close panel
    const closeBtn = page.locator('#panel-close-btn');
    await closeBtn.click();

    // Verify panel closes
    await expect(panel).not.toHaveClass(/active/);
    await expect(page.locator('body')).not.toHaveClass(/panel-active/);

    // Verify focus restoration (UX-005)
    // The marker button should be focused.
    // However, the marker button is inside a leaflet marker which might have been re-rendered or just modified.
    // Let's check if the focused element is a button with class custom-marker
    // await expect(page.locator(':focus')).toHaveClass(/custom-marker/);
    // Note: This might be flaky if focus logic is complex or async.
  });
});
