import { test, expect } from '@playwright/test';

test.describe('Digital Inheritance - Legacy Vault Audit', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Legacy Vault - Inheritance Setup Flow', async ({ page }) => {
    await page.goto('/legacy-vault');
    
    await expect(page.getByText('Digital Inheritance Hub')).toBeVisible();

    // Setup Emergency Contact
    await page.getByPlaceholder('Nama Pewaris (Ahli Waris)').fill('Ila (Soulmate)');
    await page.getByPlaceholder('Email Kontak Darurat').fill('ila@soulmate.id');
    await page.getByRole('button', { name: 'SIMPAN KONTAK DARURAT' }).click();

    // Verify Success Toast/Text
    await expect(page.getByText('Konon, data ini aman bersama kita.')).toBeVisible();

    // Trigger Wealth Snapshot
    await page.getByRole('button', { name: 'GENERATE SNAPSHOT' }).click();
    await expect(page.getByText('Snapshot Berhasil Dibuat')).toBeVisible();
    
    // Check for "Dead Man Switch" status
    await expect(page.getByText('AKTIF')).toBeVisible();
  });

});
