import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to login (base URL from config)
  await page.goto('/');

  // Use environment variables or fallback to the provided dev credentials
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('E2E_USER_EMAIL or E2E_USER_PASSWORD environment variables are missing');
  }

  console.log(`Authenticating user: ${email}`);

  // Perform login
  await page.waitForLoadState('networkidle');
  await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();

  // Wait for landing on dashboard or transactions
  // This verifies login was successful by checking that the login button is gone
  await expect(page.getByRole('button', { name: 'Log In' })).not.toBeVisible({ timeout: 20000 });

  // Save storage state for all subsequent tests
  await page.context().storageState({ path: authFile });
});
