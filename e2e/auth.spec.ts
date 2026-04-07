import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  // Ensure we start from a logged-out state for these tests
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should show login page with branding', async ({ page }) => {
    await page.goto('/');
    
    // Check for "Dompet Kita" branding
    await expect(page.getByRole('heading', { name: 'Dompet Kita' })).toBeVisible();
    await expect(page.getByText('Financial Planner')).toBeVisible();
    
    // Check for login form elements
    await expect(page.getByPlaceholder('Email Address')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
  });

  test('should show error message on invalid login', async ({ page }) => {
    await page.goto('/');
    
    await page.getByPlaceholder('Email Address').fill('salah@email.com');
    await page.getByPlaceholder('Password').fill('passwordngasal');
    
    // Note: Since we use window.alert in the code for errors, 
    // we need to handle the dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Email atau password salah');
      await dialog.dismiss();
    });
    
    await page.getByRole('button', { name: 'Log In' }).click();
  });
  
  test('should toggle to signup mode', async ({ page }) => {
    await page.goto('/');
    
    await page.getByText('Belum Punya Akun? Daftar Sekarang').click();
    
    // Check for signup specific elements
    await expect(page.getByPlaceholder('Your Panggilan Sayang')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });
});
