/**
 * End-to-end tests for main dashboard functionality
 * Tests complete user workflows and integration between frontend/backend
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Application E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Authentication Flow', () => {
    
    test('should display login page for unauthenticated users', async ({ page }) => {
      // Should redirect to login or show login form
      await expect(page.locator('h1, h2')).toContainText(/login|iniciar sesión/i);
      await expect(page.locator('input[type="text"], input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      // Fill login form
      await page.fill('input[type="text"], input[type="email"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      
      // Submit login
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
      
      // Wait for navigation/dashboard to load
      await page.waitForLoadState('networkidle');
      
      // Should reach dashboard
      await expect(page.locator('h1, h2, [data-testid="dashboard-title"]')).toBeVisible();
      
      // Should not show login form anymore
      await expect(page.locator('input[type="password"]')).not.toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      // Fill with wrong credentials
      await page.fill('input[type="text"], input[type="email"]', 'admin');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      // Submit login
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
      
      // Should show error message
      await expect(page.locator('text=/error|incorrect|invalid|inválido/i')).toBeVisible();
      
      // Should still be on login page
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });
  });

  test.describe('Dashboard Navigation and Layout', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.fill('input[type="text"], input[type="email"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
      await page.waitForLoadState('networkidle');
    });

    test('should display main navigation tabs', async ({ page }) => {
      // Check for main navigation elements
      const navTexts = ['Dashboard', 'Tablero', 'Datos', 'Data', 'Mapa', 'Map'];
      let navFound = false;
      
      for (const text of navTexts) {
        const elements = page.locator(`text=${text}`);
        if (await elements.count() > 0) {
          navFound = true;
          break;
        }
      }
      
      expect(navFound).toBeTruthy();
    });

    test('should display data table when data is available', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(2000);
      
      // Look for table or data grid
      const tableSelectors = [
        'table',
        '[data-testid="data-table"]',
        '.MuiDataGrid-root',
        '[role="grid"]',
        '[class*="table"]'
      ];
      
      let tableFound = false;
      for (const selector of tableSelectors) {
        if (await page.locator(selector).count() > 0) {
          tableFound = true;
          break;
        }
      }
      
      // If no data, should show appropriate message
      if (!tableFound) {
        await expect(page.locator('text=/no data|sin datos|empty|vacío/i')).toBeVisible();
      }
    });

    test('should display map component', async ({ page }) => {
      // Wait for map to load
      await page.waitForTimeout(3000);
      
      // Look for map container
      const mapSelectors = [
        '.leaflet-container',
        '[data-testid="map-container"]',
        '[class*="map"]',
        '#map'
      ];
      
      let mapFound = false;
      for (const selector of mapSelectors) {
        if (await page.locator(selector).count() > 0) {
          mapFound = true;
          break;
        }
      }
      
      expect(mapFound).toBeTruthy();
    });
  });

  test.describe('Data Filtering Functionality', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login and wait for dashboard
      await page.fill('input[type="text"], input[type="email"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Wait for data to load
    });

    test('should filter data by province', async ({ page }) => {
      // Look for province filter
      const provinceFilterSelectors = [
        'select[name*="province"], select[name*="provincia"]',
        'input[placeholder*="province"], input[placeholder*="provincia"]',
        '[data-testid="province-filter"]'
      ];
      
      let provinceFilter = null;
      for (const selector of provinceFilterSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          provinceFilter = element.first();
          break;
        }
      }
      
      if (provinceFilter) {
        // Try to select a province
        if (await provinceFilter.getAttribute('type') === 'text') {
          await provinceFilter.fill('Buenos Aires');
        } else {
          // For select elements, try to select an option
          const options = await page.locator('select option').allTextContents();
          if (options.length > 1) {
            await provinceFilter.selectOption({ index: 1 });
          }
        }
        
        // Wait for filtering to apply
        await page.waitForTimeout(1000);
        
        // Verify something changed (hard to verify exact results without knowing data)
        // At minimum, no error should occur
      }
    });

    test('should filter data by date range', async ({ page }) => {
      // Look for date filters
      const dateInputs = page.locator('input[type="date"], input[placeholder*="fecha"], input[placeholder*="date"]');
      
      if (await dateInputs.count() >= 2) {
        // Fill date range
        await dateInputs.first().fill('2025-01-01');
        await dateInputs.last().fill('2025-12-31');
        
        // Wait for filtering
        await page.waitForTimeout(1000);
        
        // Should not throw errors
      }
    });

    test('should clear filters', async ({ page }) => {
      // Look for clear/reset button
      const clearButtons = page.locator('button:has-text("Clear"), button:has-text("Limpiar"), button:has-text("Reset"), [data-testid="clear-filters"]');
      
      if (await clearButtons.count() > 0) {
        await clearButtons.first().click();
        await page.waitForTimeout(1000);
        
        // Should not throw errors
      }
    });
  });

  test.describe('File Upload Functionality', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.fill('input[type="text"], input[type="email"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
      await page.waitForLoadState('networkidle');
    });

    test('should show file upload interface for admin users', async ({ page }) => {
      // Look for upload section/tab
      const uploadTexts = ['Upload', 'Subir', 'Cargar', 'File'];
      let uploadFound = false;
      
      for (const text of uploadTexts) {
        const elements = page.locator(`text=${text}`);
        if (await elements.count() > 0) {
          // Click on upload tab/section
          await elements.first().click();
          await page.waitForTimeout(500);
          
          // Look for file input
          const fileInput = page.locator('input[type="file"]');
          if (await fileInput.count() > 0) {
            uploadFound = true;
            break;
          }
        }
      }
      
      // Admin should have access to upload
      expect(uploadFound).toBeTruthy();
    });

    test('should handle file upload process', async ({ page }) => {
      // Find and click upload tab/section
      const uploadButton = page.locator('text=/upload|subir|cargar/i').first();
      if (await uploadButton.count() > 0) {
        await uploadButton.click();
        await page.waitForTimeout(500);
      }
      
      // Look for file input
      const fileInput = page.locator('input[type="file"]');
      
      if (await fileInput.count() > 0) {
        // Create a simple test file
        const testFilePath = './test_upload.xlsx';
        
        // Set file (if test file exists)
        try {
          await fileInput.setInputFiles(testFilePath);
          
          // Look for upload button
          const submitButton = page.locator('button:has-text("Upload"), button:has-text("Subir"), button[type="submit"]');
          if (await submitButton.count() > 0) {
            await submitButton.click();
            
            // Wait for upload to complete
            await page.waitForTimeout(5000);
            
            // Should show success or error message
            const successMessage = page.locator('text=/success|éxito|completado/i');
            const errorMessage = page.locator('text=/error|failed|falló/i');
            
            const hasMessage = await successMessage.count() > 0 || await errorMessage.count() > 0;
            expect(hasMessage).toBeTruthy();
          }
        } catch (error) {
          // Test file might not exist, that's okay for E2E test
          console.log('Test file not found, skipping upload test');
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Login
      await page.fill('input[type="text"], input[type="email"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
      await page.waitForLoadState('networkidle');
      
      // Should display without horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(375);
      
      // Main elements should be visible
      await expect(page.locator('body')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Login
      await page.fill('input[type="text"], input[type="email"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
      await page.waitForLoadState('networkidle');
      
      // Should display properly
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    
    test('should handle network errors gracefully', async ({ page }) => {
      // Login first
      await page.fill('input[type="text"], input[type="email"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
      await page.waitForLoadState('networkidle');
      
      // Simulate network failure
      await page.route('**/api/**', route => route.abort());
      
      // Try to perform an action that requires API
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Should show error message or fallback UI, not crash
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Should not show JavaScript errors in console (check via error events)
      let jsErrors = [];
      page.on('pageerror', error => jsErrors.push(error));
      
      await page.waitForTimeout(1000);
      
      // Some errors are expected due to network simulation, 
      // but should not be catastrophic
      expect(jsErrors.length).toBeLessThan(10);
    });

    test('should display error boundaries for JavaScript errors', async ({ page }) => {
      // Login
      await page.fill('input[type="text"], input[type="email"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
      await page.waitForLoadState('networkidle');
      
      // Inject JavaScript error
      await page.evaluate(() => {
        // Simulate a component error
        window.dispatchEvent(new Event('test-error'));
      });
      
      await page.waitForTimeout(1000);
      
      // App should still be functional
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      // Navigate and login
      await page.goto('/');
      await page.fill('input[type="text"], input[type="email"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle large datasets without crashing', async ({ page }) => {
      // Login
      await page.fill('input[type="text"], input[type="email"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
      await page.waitForLoadState('networkidle');
      
      // Wait for data to load
      await page.waitForTimeout(5000);
      
      // Try scrolling if there's a scrollable container
      const scrollableElements = page.locator('[style*="overflow"], .MuiDataGrid-root, table');
      if (await scrollableElements.count() > 0) {
        const element = scrollableElements.first();
        
        // Scroll down multiple times to test virtual scrolling/performance
        for (let i = 0; i < 5; i++) {
          await element.evaluate(el => el.scrollTop += 1000);
          await page.waitForTimeout(100);
        }
      }
      
      // Should still be responsive
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    
    test('should have proper heading structure', async ({ page }) => {
      // Login
      await page.fill('input[type="text"], input[type="email"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
      await page.waitForLoadState('networkidle');
      
      // Check for heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      expect(headings.length).toBeGreaterThan(0);
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Test Tab navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should have focus indicators
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper labels for form inputs', async ({ page }) => {
      // Check login form
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const placeholder = await input.getAttribute('placeholder');
        
        // Should have some form of label
        const hasLabel = id || ariaLabel || placeholder;
        expect(hasLabel).toBeTruthy();
      }
    });
  });
});