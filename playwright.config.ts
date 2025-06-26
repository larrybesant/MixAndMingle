import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // You can add more config options here as needed
});
