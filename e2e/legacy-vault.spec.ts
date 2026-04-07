import { test, expect } from '@playwright/test';

test.describe('E2E Module - Legacy Vault & Security Sentinel', () => {
  
  test.beforeEach(async ({ page }) => {
    // Rely on global storage state
    await page.goto('/legacy-vault');
  });

  test('Digital Legacy Readiness (Heartbeat)', async ({ page }) => {
    await page.goto('/legacy'); // URL based on App.tsx
    await expect(page.getByText('Digital Legacy Vault')).toBeVisible();
    
    // Heartbeat Status Check
    await expect(page.getByText('Digital Heartbeat Active')).toBeVisible();
    await expect(page.getByText('Threshold Status')).toBeVisible();
    await expect(page.getByText('Bulan')).toContainText(/3|6|12/); // Common values
  });

  test('Access Heir Information', async ({ page }) => {
    await page.goto('/legacy');
    await expect(page.getByText('Designated Partner')).toBeVisible();
    
    // Check if heir/partner is defined
    await expect(page.getByText('Partner / Heir')).toBeVisible();
  });

  test('Vault Archive Access', async ({ page }) => {
    await page.goto('/legacy');
    await expect(page.getByText('Vault Archive')).toBeVisible();
    
    // Verify Snapshots are present
    const snapshots = page.locator('div:has-text("Snapshot Finansial")');
    await expect(snapshots).toHaveCount(3);
  });

});
