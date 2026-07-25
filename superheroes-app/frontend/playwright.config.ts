import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  testMatch: '**/*.spec.ts',
  use: {
    baseURL: 'http://localhost:41072',
    headless: true,
  },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:41072',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
