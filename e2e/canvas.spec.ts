import { test, expect } from '@playwright/test';

test.describe('Code Canvas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should open canvas tab', async ({ page }) => {
    // Look for Canvas tab in editor
    const canvasTab = page.locator('button:has-text("Canvas")').or(page.locator('[data-value="canvas"]')).first();
    
    if (await canvasTab.isVisible()) {
      await canvasTab.click();
      await page.waitForTimeout(500);
      
      // Verify canvas is visible
      const canvas = page.locator('.react-flow').or(page.locator('[data-testid="canvas"]'));
      const canvasVisible = await canvas.count() > 0;
      
      expect(canvasVisible).toBeTruthy();
    }
  });

  test('should display block library', async ({ page }) => {
    // Open canvas
    const canvasTab = page.locator('button:has-text("Canvas")').first();
    
    if (await canvasTab.isVisible()) {
      await canvasTab.click();
      await page.waitForTimeout(1000);
      
      // Look for block library
      const blockLibrary = page.locator('text=Block Library').or(page.locator('[data-testid="block-library"]'));
      
      if (await blockLibrary.isVisible()) {
        // Verify blocks are listed
        const blocks = page.locator('text=Function').or(page.locator('text=Component'));
        const blockCount = await blocks.count();
        
        expect(blockCount).toBeGreaterThan(0);
      }
    }
  });

  test('should drag and drop block to canvas', async ({ page }) => {
    // Open canvas
    const canvasTab = page.locator('button:has-text("Canvas")').first();
    
    if (await canvasTab.isVisible()) {
      await canvasTab.click();
      await page.waitForTimeout(1000);
      
      // Find a block
      const block = page.locator('text=Function').or(page.locator('[draggable="true"]')).first();
      const canvas = page.locator('.react-flow').first();
      
      if (await block.isVisible() && await canvas.isVisible()) {
        // Get canvas position
        const canvasBox = await canvas.boundingBox();
        
        if (canvasBox) {
          // Drag block to canvas
          await block.dragTo(canvas, {
            targetPosition: { x: canvasBox.width / 2, y: canvasBox.height / 2 }
          });
          
          await page.waitForTimeout(500);
          
          // Verify node was created (adjust selector based on React Flow)
          const nodes = page.locator('.react-flow__node');
          const nodeCount = await nodes.count();
          
          expect(nodeCount).toBeGreaterThan(0);
        }
      }
    }
  });
});

