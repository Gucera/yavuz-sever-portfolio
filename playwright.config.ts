import { defineConfig } from '@playwright/test'

// End-to-end tests run against the dev server in the locally installed Chrome
// (no browser download needed).
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  workers: 4,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5175',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: 'npx vite --port 5175 --strictPort',
    url: 'http://localhost:5175',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
