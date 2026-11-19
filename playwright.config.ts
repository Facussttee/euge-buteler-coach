import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4322' },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4322 --ignore-lock',
    url: 'http://127.0.0.1:4322',
    env: { ASTRO_TELEMETRY_DISABLED: '1', NETLIFY: 'true' },
  },
})
