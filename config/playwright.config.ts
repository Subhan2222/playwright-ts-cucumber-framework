import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const headless = process.env.HEADLESS?.toLowerCase() !== 'false';

export default defineConfig({
  testDir: './tests',
  timeout: Number(process.env.TIMEOUT ?? 30000),
  use: {
    headless,
    baseURL: process.env.BASE_URL ?? 'https://example.com',
  },
});
