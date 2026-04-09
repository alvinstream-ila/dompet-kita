import { test, expect } from '@playwright/test';
import path from 'node:path';

test.describe('AI Intelligence - Full Spectrum Regulatory Audit', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard first to ensure auth state is loaded
    await page.goto('/');
  });

  test('Scanner AI - Receipt OCR and Extraction', async ({ page }) => {
    await page.goto('/scanner');
    
    // Upload Mock Receipt
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('input[type="file"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'fixtures/mock_receipt.png'));

    await page.getByRole('button', { name: 'PROSES STRUK' }).click();

    // Semantic Verification: Check if detected amount is reasonable (e.g. 150.000)
    await expect(page.getByText('Hasil Deteksi AI')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('input[name="amount"]')).toHaveValue('150000');
  });

  test('Tax Assistant - PPh 21 TER (Jan-Nov) Audit', async ({ page }) => {
    await page.goto('/reports');
    if (await page.getByText('TAX ASSISTANT').isVisible()) {
        await page.getByText('TAX ASSISTANT').click();
    }

    // --- CASE 1: Kategori A (TK/0) ---
    await page.getByPlaceholder('Gaji Bruto Bulanan').fill('10000000');
    await page.selectOption('select[name="ptkp_status"]', 'TK/0');
    await page.getByRole('button', { name: 'HITUNG PAJAK' }).click();
    
    // Verify TER Rate visibility (PP 58/2023 Kategori A)
    await expect(page.getByText('KATEGORI A')).toBeVisible();
    await expect(page.locator('.tax-result-amount')).not.toHaveText('Rp 0');

    // --- CASE 2: Kategori B (K/1) ---
    await page.selectOption('select[name="ptkp_status"]', 'K/1');
    await page.getByRole('button', { name: 'HITUNG PAJAK' }).click();
    await expect(page.getByText('KATEGORI B')).toBeVisible();
  });

  test('Tax Assistant - December Pasal 17 Recalculation', async ({ page }) => {
    await page.goto('/reports');
    // Toggle to "Perhitungan Desember" if the UI supports it
    const decemberToggle = page.getByRole('switch', { name: 'Mode Akhir Tahun' }).or(page.getByText('Mode Desember'));
    if (await decemberToggle.isVisible()) {
        await decemberToggle.click();
    }

    await page.getByPlaceholder('Gaji Bruto Tahunan').fill('150000000');
    await page.getByRole('button', { name: 'HITUNG ULANG PASAL 17' }).click();

    // Verify official Pasal 17 Progressive Logic
    // Total Tax should include PTKP deduction before applying 5%, 15%, etc.
    await expect(page.getByText('PENGURANG (PTKP + BIAYA JABATAN)')).toBeVisible();
    await expect(page.getByText('PPh 21 TERHUTANG SETAHUN')).toBeVisible();
  });

  test('Wealth Intelligence - CFO AI Advisory', async ({ page }) => {
    await page.goto('/wealth');
    await expect(page.getByText('PROYEKSI HARTA 12 BULAN')).toBeVisible();
    
    await page.getByRole('button', { name: 'TANYA CFO AI' }).click();
    
    // Semantic Check: Response should contain financial advice keywords
    const aiResponse = page.locator('.ai-advice-bubble');
    await expect(aiResponse).toContainText(/investasi|saldo|inflasi|kekayaan/i);
  });

});
