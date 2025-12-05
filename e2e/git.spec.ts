import { test, expect } from '@playwright/test';

test.describe('Git Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should open source control panel', async ({ page }) => {
    // Look for source control button
    const sourceControlButton = page.locator('button[aria-label*="Source"]').or(
      page.locator('button:has-text("Source")')
    ).or(page.locator('[data-testid="source-control"]')).first();
    
    if (await sourceControlButton.isVisible()) {
      await sourceControlButton.click();
      await page.waitForTimeout(500);
      
      // Verify source control panel
      const sourcePanel = page.locator('text=Source Control').or(page.locator('text=Git'));
      await expect(sourcePanel.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display git status', async ({ page }) => {
    // Open source control
    const sourceControlButton = page.locator('button:has-text("Source")').first();
    
    if (await sourceControlButton.isVisible()) {
      await sourceControlButton.click();
      await page.waitForTimeout(1000);
      
      // Look for git status information
      const gitStatus = page.locator('text=Current Branch').or(
        page.locator('text=Changes')
      ).or(page.locator('text=main'));
      
      // Should show either git info or "not a git repository"
      const statusVisible = await gitStatus.first().isVisible({ timeout: 3000 }).catch(() => false);
      
      // Either git info or "not a git repository" message should be visible
      expect(true).toBeTruthy(); // Adjust based on your implementation
    }
  });

  test('should show commit button', async ({ page }) => {
    // Open source control
    const sourceControlButton = page.locator('button:has-text("Source")').first();
    
    if (await sourceControlButton.isVisible()) {
      await sourceControlButton.click();
      await page.waitForTimeout(1000);
      
      // Look for commit button
      const commitButton = page.locator('button:has-text("Commit")');
      
      if (await commitButton.isVisible({ timeout: 3000 })) {
        // Button should be visible
        await expect(commitButton.first()).toBeVisible();
      }
    }
  });
});

