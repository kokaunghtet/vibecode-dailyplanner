import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';

try {
  for (const line of readFileSync('.env.e2e.local', 'utf-8').split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] ??= rest.join('=').trim();
  }
} catch {
  // no local env file — CI must set E2E_EMAIL/E2E_PASSWORD directly
}

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    ...devices['Desktop Chrome'],
    channel: 'chrome',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
