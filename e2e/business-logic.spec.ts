import { test, expect } from '@playwright/test';

test.describe('Business Logic - Loans and Goals Audit', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard first to ensure auth state is loaded
    await page.goto('/');
  });

  test('Loan Tracker - Manage Business Receivables', async ({ page }) => {
    await page.goto('/loans');
    
    // Add new loan
    await page.getByText('TAMBAH PIUTANG').click();
    await page.getByPlaceholder('Nama Peminjam').fill('E2E Debtor Test');
    await page.getByPlaceholder('Ex: Modal Dagang').fill('Test Modal Bisnis');
    await page.getByPlaceholder('0').fill('200000');
    await page.getByRole('button', { name: 'SIMPAN DATA' }).click();

    // Verify in list
    await expect(page.getByText('E2E Debtor Test')).toBeVisible();
    await expect(page.getByText('Rp. 200.000')).toBeVisible();

    // Mark as Paid
    await page.locator('button:has-text("LUNAS")').first().click();
    await page.getByRole('button', { name: 'KONFIRMASI' }).click();

    // Verify it's moved to history or marked
    await expect(page.getByText('E2E Debtor Test')).not.toBeVisible({ timeout: 10000 });
  });

  test('Mimpi Kita - Savings Goal Journey', async ({ page }) => {
    await page.goto('/mimpi-kita');
    
    // Create Goal
    await page.getByText('BUAT MIMPI BARU').click();
    await page.getByPlaceholder('Apa Impian Kamu?').fill('E2E Dream Trip');
    await page.getByPlaceholder('Target Dana').fill('5000000');
    await page.getByRole('button', { name: 'MULAI BERMIMPI' }).click();

    // Verify creation
    await expect(page.getByText('E2E Dream Trip')).toBeVisible();
    await expect(page.getByText('Rp. 5.000.000')).toBeVisible();

    // Add Progress
    await page.locator('button:has(svg.lucide-plus-circle)').first().click();
    await page.getByPlaceholder('Nominal Tabungan').fill('500000');
    await page.getByRole('button', { name: 'TABUNG SEKARANG' }).click();

    // Check progress bar update (basic check for visibility)
    await expect(page.locator('.bg-sky-400')).toBeVisible();
  });

  test('Holiday Budgeting - Trip Planning', async ({ page }) => {
    await page.goto('/holiday');
    await expect(page.getByText('Rencana Liburan Kita')).toBeVisible();
    
    // Check if placeholder for new trip exists
    await expect(page.getByText('ESTIMASI BIAYA')).toBeVisible();
  });

});
