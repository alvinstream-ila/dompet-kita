import { test, expect } from '@playwright/test';

test.describe('E2E Module - Family Hub & MimpiKita', () => {
  
  test.beforeEach(async ({ page }) => {
    // Rely on global storage state
    await page.goto('/family-hub');
  });

  test('MimpiKita (Goals) Management', async ({ page }) => {
    await page.goto('/mimpikita');
    await expect(page.getByText('Cinta & Cita')).toBeVisible();

    // Open Modal
    await page.getByText('Mimpi Baru').click();
    await expect(page.getByText('Tambah Mimpi')).toBeVisible();

    // Create Goal (E2E simulation)
    await page.getByPlaceholder('Nama Mimpi').fill('Liburan ke Swiss Test');
    await page.getByPlaceholder('Target Nominal').fill('50000000');
    await page.getByRole('button', { name: 'SIMPAN MIMPI' }).click();

    // Verify
    await expect(page.getByText('Liburan ke Swiss Test')).toBeVisible();
    await expect(page.getByText('0%')).toBeVisible(); // Initial progress
  });

  test('Loan Tracker Mastery (Hutang & Piutang)', async ({ page }) => {
    await page.goto('/loans');
    await expect(page.getByText('Titipan Sayang')).toBeVisible();

    // Add Loan
    await page.getByText('Tambah Baru').click(); // Adjust if button text differs
    await page.getByPlaceholder('Nama Debitur/Kreditur').fill('Teman Test Loan');
    await page.getByPlaceholder('Nominal Titipan').fill('200000');
    await page.getByPlaceholder('Keterangan Pinjaman').fill('Titip makan siang');
    await page.getByRole('button', { name: 'SIMPAN TITIPAN' }).click();

    // Verify
    await expect(page.getByText('Teman Test Loan')).toBeVisible();
    await expect(page.getByText('Rp 200.000')).toBeVisible();
    
    // Mark as Paid (if applicable in UI)
    // await page.getByRole('button', { name: 'Selesaikan' }).click();
  });

  test('Family Hub Health Check', async ({ page }) => {
    await page.goto('/familyhub');
    await expect(page.getByText('Analisis Kesehatan Finansial Kita')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
  });
});
