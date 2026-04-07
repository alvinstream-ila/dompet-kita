import { test, expect } from '@playwright/test';

test.describe('E2E Module - Transactions (Cuan & Jajan)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Rely on global storage state
    await page.goto('/transactions');
  });

  test('Search and Filter Transactions', async ({ page }) => {
    // Check search functionality
    const searchInput = page.getByPlaceholder('Cari transaksi...');
    await searchInput.fill('Test');
    await expect(page.locator('text=Jejak Belum Ditemukan').or(page.locator('.transaction-item'))).toBeVisible();

    // Check category filter
    await page.locator('select').first().selectOption({ label: 'Semua' });
  });

  test('Create and Delete Transaction Flow', async ({ page }) => {
    await page.goto('/');
    await page.getByText('TAMBAH TRANSAKSI').click();
    
    // Fill form
    await page.getByPlaceholder('0').fill('75000');
    await page.getByPlaceholder('Misal : Ongkos Perjalanan').fill('E2E Test Transaction');
    await page.getByRole('button', { name: 'SIMPAN TRANSAKSI' }).click();

    // Verify in list
    await page.goto('/transactions');
    const transactionRow = page.getByRole('row').filter({ hasText: 'E2E Test Transaction' });
    await expect(transactionRow).toBeVisible();

    // Delete the specific transaction
    await transactionRow.getByRole('button').filter({ has: page.locator('svg.lucide-trash2') }).click();
    await page.getByRole('button', { name: 'HAPUS' }).click();
    
    await expect(page.getByText('E2E Test Transaction')).not.toBeVisible();
  });
});
