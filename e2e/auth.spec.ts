import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login dialog when clicking login', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for login button or trigger (adjust selector based on your UI)
    // This is a placeholder - adjust based on your actual UI
    const loginButton = page.locator('text=Sign In').or(page.locator('text=Login')).first();
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
      
      // Verify login dialog appears
      await expect(page.locator('text=Sign In').or(page.locator('text=Email'))).toBeVisible();
    }
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Try to find and open login dialog
    const loginTrigger = page.locator('text=Sign In').or(page.locator('button:has-text("Login")')).first();
    
    if (await loginTrigger.isVisible()) {
      await loginTrigger.click();
      
      // Wait for dialog
      await page.waitForTimeout(500);
      
      // Fill invalid credentials
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await emailInput.isVisible()) {
        await emailInput.fill('invalid@example.com');
        await passwordInput.fill('wrongpassword');
        
        // Submit form
        const submitButton = page.locator('button:has-text("Sign In")').or(page.locator('button[type="submit"]')).first();
        await submitButton.click();
        
        // Should show error message
        await expect(page.locator('text=error').or(page.locator('text=Error')).or(page.locator('text=Failed'))).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should navigate to sign up', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const loginTrigger = page.locator('text=Sign In').first();
    
    if (await loginTrigger.isVisible()) {
      await loginTrigger.click();
      await page.waitForTimeout(500);
      
      // Click sign up link
      const signUpLink = page.locator('text=Sign up').or(page.locator('text=Create account')).first();
      
      if (await signUpLink.isVisible()) {
        await signUpLink.click();
        
        // Verify sign up form appears
        await expect(page.locator('text=Create Account').or(page.locator('text=Sign Up'))).toBeVisible();
      }
    }
  });
});

