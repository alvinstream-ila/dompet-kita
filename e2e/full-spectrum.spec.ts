import { test, expect } from '@playwright/test';

test.describe('Full Spectrum - Financial Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Rely on global storage state
    await page.goto('/transactions');
    await expect(page.getByText('DompetKita')).toBeVisible();
  });

  test('Core Navigation - Dashboard Audit', async ({ page }) => {
    // Check main sections exist
    await expect(page.getByText('Total Saldo')).toBeVisible();
    await expect(page.getByText('Pemasukan')).toBeVisible();
    await expect(page.getByText('Pengeluaran')).toBeVisible();
    
    // Check Quick Actions
    await expect(page.getByText('TAMBAH TRANSAKSI')).toBeVisible();
    await expect(page.getByText('SCAN STRUK')).toBeVisible();

    // Visual Regression Check
    // Calibrated for Native Windows Rendering (no Docker)
    // Masking all dynamic currency values and charts to focus on layout integrity
    await expect(page).toHaveScreenshot('dashboard-baseline.png', {
        mask: [
            page.locator('canvas'), // Charts
            page.getByText(/Rp/i), // All currency amounts
            page.locator('.animate-pulse'), // Loading states
            page.locator('.dynamic-value') // Custom dynamic classes
        ]
    });
  });

  test('Transaction Management - CRUD Flow', async ({ page }) => {
    // 1. Create Transaction
    await page.getByText('TAMBAH TRANSAKSI').click();
    await expect(page.getByText('SIMPAN TRANSAKSI')).toBeVisible();
    
    await page.getByPlaceholder('0').fill('50000');
    await page.getByPlaceholder('Misal : Ongkos Perjalanan').fill('Test Jajan Sore');
    
    // Select Category (assuming it's a select trigger)
    await page.locator('button:has-text("Kebutuhan")').first().click(); // Default usually
    
    await page.getByRole('button', { name: 'SIMPAN TRANSAKSI' }).click();
    
    // 2. Verify in Recent Transactions
    await page.goto('/transactions');
    await expect(page.getByText('Test Jajan Sore')).toBeVisible();
    await expect(page.getByText('Rp. 50.000')).toBeVisible();
    
    // 3. Delete Transaction
    await page.locator('button:has(svg.lucide-trash2)').first().click();
    await page.getByRole('button', { name: 'HAPUS' }).click();
    
    await expect(page.getByText('Test Jajan Sore')).not.toBeVisible();
  });

  test('Wealth Management - Asset Growth', async ({ page }) => {
    await page.goto('/wealth');
    
    // Add Asset
    await page.locator('button:has(svg.lucide-plus)').first().click();
    await page.getByPlaceholder('Nama Aset').fill('Tabungan Emas Test');
    await page.getByPlaceholder('Nominal Aset').fill('1000000');
    await page.getByRole('button', { name: 'SIMPAN ASET' }).click();
    
    // Verify
    await expect(page.getByText('Tabungan Emas Test')).toBeVisible();
    
    // Check Simulation Chart visibility
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('Reports & Analytics - Visual Integrity', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByText('Statistik Finansial')).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(1);
  });

});
