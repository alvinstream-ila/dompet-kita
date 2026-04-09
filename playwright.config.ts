import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';

// Read from ".env" file.
dotenv.config({ path: path.resolve(__dirname, '.env') });


/**
 * Playwright Config: Hybrid Sentinel (v6.3)
 * Testing directly against production to ensure zero-regression for Alvin & Ila.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 120 * 1000,
  expect: {
    timeout: 30 * 1000,
    toHaveScreenshot: {
        maxDiffPixelRatio: 0.1, // Native Windows Rendering Calibration
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2, // Capped at 2 for local Windows stability
  reporter: 'html',
  use: {
    /* Target: Local Development */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
  },
  webServer: {
    command: 'npm run e2e:serve',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300 * 1000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
