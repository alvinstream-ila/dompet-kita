import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to login (base URL from config)
  await page.goto('/');

  // Use environment variables or fallback to the provided dev credentials
  const email = process.env.E2E_USER_EMAIL || 'alvin@placeholder.com';
  const password = process.env.E2E_USER_PASSWORD || 'password123';

  console.log(`Authenticating user: ${email}`);

  // Perform login
  await page.getByPlaceholder('Email Address').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();

  // Wait for landing on dashboard or transactions
  // This verifies login was successful
  await expect(page).toHaveURL(/.*(dashboard|transactions)/);

  // Save storage state for all subsequent tests
  await page.context().storageState({ path: authFile });
});
