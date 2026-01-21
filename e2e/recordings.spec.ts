import { test, expect } from '@playwright/test';

test.describe('Recordings Page', () => {
  test('should display recordings page directly', async ({ page }) => {
    await page.goto('/recordings');

    // Should be on recordings page
    await expect(page).toHaveURL('/recordings');
    // The title is in the Header component
    await expect(page.locator('header')).toContainText('Recordings');
  });

  test('should show empty state when no recordings exist', async ({ page }) => {
    await page.goto('/recordings');

    // Should show empty state message
    await expect(page.locator('text=No recordings yet')).toBeVisible();
  });

  test('should have a button to start practicing', async ({ page }) => {
    await page.goto('/recordings');

    // Should have a "Start Practice" button (goes to /setup)
    const practiceButton = page.locator('button:has-text("Start Practice")');
    await expect(practiceButton).toBeVisible();
  });

  test('should show storage info', async ({ page }) => {
    await page.goto('/recordings');

    // Should show storage information
    await expect(page.locator('text=Storage used')).toBeVisible();
  });

  test('should navigate to recordings via menu', async ({ page }) => {
    await page.goto('/practice');

    // Open the menu
    const menuButton = page.locator('header button').last();
    await menuButton.click();

    // Click on Recordings in the menu
    await page.click('nav >> text=Recordings');

    // Should be on recordings page
    await expect(page).toHaveURL('/recordings');
  });
});

test.describe('Practice Page', () => {
  test('should show practice interface', async ({ page }) => {
    await page.goto('/practice');

    // Should show the header
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display topic and framework', async ({ page }) => {
    await page.goto('/practice');

    // Wait for content to load
    await page.waitForTimeout(1000);

    // Should have some content visible (timer, buttons, or topic text)
    const content = page.locator('main, [class*="flex-1"]');
    await expect(content.first()).toBeVisible();
  });

  test('should have timer controls', async ({ page }) => {
    await page.goto('/practice');

    // Wait for page load
    await page.waitForTimeout(500);

    // Should have play/pause or timer controls
    const playPauseButton = page.locator('button').filter({ has: page.locator('svg') });
    await expect(playPauseButton.first()).toBeVisible();
  });
});

test.describe('Recording Flow UI', () => {
  test.beforeEach(async ({ context }) => {
    // Grant microphone permissions
    await context.grantPermissions(['microphone']);
  });

  test('should load practice page without errors', async ({ page }) => {
    await page.goto('/practice');

    // Wait for the page to fully load
    await page.waitForTimeout(500);

    // The page should load without errors
    await expect(page.locator('header')).toBeVisible();
  });
});

test.describe('Recording Detail Page', () => {
  test('should show not found for non-existent recording', async ({ page }) => {
    await page.goto('/recordings/non-existent-id');

    // Should show not found message
    await expect(page.locator('text=Recording not found')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages using menu', async ({ page }) => {
    // Start from practice page (which has header with menu)
    await page.goto('/practice');

    // Open the menu
    const menuButton = page.locator('header button').last();
    await menuButton.click();

    // Navigate to Recordings
    await page.click('nav >> text=Recordings');
    await expect(page).toHaveURL('/recordings');

    // Navigate back to home via menu
    await page.locator('header button').last().click();
    await page.click('nav >> text=Home');
    await expect(page).toHaveURL('/');
  });

  test('should show header on pages that use it', async ({ page }) => {
    // Practice page has header
    await page.goto('/practice');
    await expect(page.locator('header')).toBeVisible();

    // Recordings page has header
    await page.goto('/recordings');
    await expect(page.locator('header')).toBeVisible();
  });

  test('should navigate to recordings page and back', async ({ page }) => {
    await page.goto('/recordings');

    // Verify we're on recordings page
    await expect(page.locator('header')).toContainText('Recordings');

    // Click back button
    const backButton = page.locator('header button').first();
    await backButton.click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Home Page', () => {
  test('should show app title and start button', async ({ page }) => {
    await page.goto('/');

    // Should have the app name
    await expect(page.locator('h1:has-text("Impromptu")')).toBeVisible();

    // Should have start practice link
    await expect(page.locator('a:has-text("Start Practice")')).toBeVisible();
  });

  test('should navigate to setup when clicking Start Practice', async ({ page }) => {
    await page.goto('/');

    // Click Start Practice
    await page.click('a:has-text("Start Practice")');

    // Should navigate to setup
    await expect(page).toHaveURL('/setup');
  });
});
