// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Guided Tour Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/');

    // Bypass the initial animation by clicking Start Journey
    const startBtn = page.locator('#start-journey-btn');
    await startBtn.waitFor({ state: 'visible' });
    await startBtn.click();

    // Wait for map to settle and tour button to appear
    const tourBtn = page.locator('#start-tour-btn');
    await tourBtn.waitFor({ state: 'visible', timeout: 10000 });
  });

  test('should start the tour and show the first location', async ({ page }) => {
    // Click Start Tour
    await page.click('#start-tour-btn');

    // Verify Tour Card appears
    const tourCard = page.locator('.tour-card');
    await expect(tourCard).toBeVisible();

    // Verify first stop content (Pyramids of Giza is usually first)
    // We check for generic structure if data might change, but let's assume we can check for text "Stop 1"
    await expect(page.locator('.tour-progress')).toContainText('Stop 1');

    // Verify Progressive Disclosure: Description snippet visible, full description hidden
    const snippet = page.locator('.tour-snippet');
    await expect(snippet).toBeVisible();

    const expandedContent = page.locator('.tour-expanded-content');
    await expect(expandedContent).toBeHidden();
  });

  test('should navigate through the tour', async ({ page }) => {
    await page.click('#start-tour-btn');

    // Check Stop 1
    await expect(page.locator('.tour-progress')).toContainText('Stop 1');

    // Click Next
    await page.click('.tour-nav-btn.next');

    // Check Stop 2
    await expect(page.locator('.tour-progress')).toContainText('Stop 2');

    // Click Previous
    await page.click('.tour-nav-btn.prev');

    // Check Stop 1 again
    await expect(page.locator('.tour-progress')).toContainText('Stop 1');
  });

  test('should expand details on "Tell me more"', async ({ page }) => {
    await page.click('#start-tour-btn');

    const moreBtn = page.locator('.tour-more-btn');
    const expandedContent = page.locator('.tour-expanded-content');

    // Initially hidden
    await expect(expandedContent).toBeHidden();

    // Click to expand
    await moreBtn.click();

    // Now visible
    await expect(expandedContent).toBeVisible();
    await expect(moreBtn).toContainText('Show less');

    // Click to collapse
    await moreBtn.click();
    await expect(expandedContent).toBeHidden();
  });

  test('should exit the tour', async ({ page }) => {
    await page.click('#start-tour-btn');
    const tourCard = page.locator('.tour-card');
    await expect(tourCard).toBeVisible();

    // Click Exit (X) button
    await page.click('.tour-close-btn');

    // Tour Card hidden
    await expect(tourCard).toBeHidden();

    // Start Tour button visible again
    await expect(page.locator('#start-tour-btn')).toBeVisible();
  });
});
