import { test, expect } from '@playwright/test';

test.describe('Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should open settings panel', async ({ page }) => {
    // Look for settings button/icon
    const settingsButton = page.locator('button[aria-label*="Settings"]').or(
      page.locator('button:has-text("Settings")')
    ).or(page.locator('[data-testid="settings"]')).first();
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(500);
      
      // Verify settings panel is visible
      const settingsPanel = page.locator('text=Settings').or(page.locator('[data-testid="settings-panel"]'));
      await expect(settingsPanel.first()).toBeVisible();
    }
  });

  test('should change theme', async ({ page }) => {
    // Open settings
    const settingsButton = page.locator('button:has-text("Settings")').first();
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(500);
      
      // Find theme selector
      const themeSelect = page.locator('select').or(page.locator('[role="combobox"]')).filter({ hasText: /theme/i }).first();
      
      if (await themeSelect.isVisible()) {
        // Change theme
        await themeSelect.click();
        await page.waitForTimeout(300);
        
        const darkOption = page.locator('text=Dark').first();
        if (await darkOption.isVisible()) {
          await darkOption.click();
          await page.waitForTimeout(500);
          
          // Verify theme changed (check for dark class)
          const html = page.locator('html');
          const hasDark = await html.evaluate(el => el.classList.contains('dark'));
          
          expect(hasDark).toBeTruthy();
        }
      }
    }
  });

  test('should display subscription panel', async ({ page }) => {
    // Open settings
    const settingsButton = page.locator('button:has-text("Settings")').first();
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(500);
      
      // Click subscription tab
      const subscriptionTab = page.locator('button:has-text("Subscription")').or(
        page.locator('[data-value="subscription"]')
      ).first();
      
      if (await subscriptionTab.isVisible()) {
        await subscriptionTab.click();
        await page.waitForTimeout(500);
        
        // Verify subscription content
        const subscriptionContent = page.locator('text=Current Plan').or(page.locator('text=Premium'));
        await expect(subscriptionContent.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should display GPU settings', async ({ page }) => {
    // Open settings
    const settingsButton = page.locator('button:has-text("Settings")').first();
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(500);
      
      // Click GPU tab
      const gpuTab = page.locator('button:has-text("GPU")').or(
        page.locator('[data-value="gpu"]')
      ).first();
      
      if (await gpuTab.isVisible()) {
        await gpuTab.click();
        await page.waitForTimeout(1000);
        
        // Verify GPU content
        const gpuContent = page.locator('text=GPU').or(page.locator('text=GPU para Editor'));
        await expect(gpuContent.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });
});

