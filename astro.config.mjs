import { defineConfig } from 'astro/config'

export default defineConfig({
  site: process.env.CF_PAGES_URL || 'https://euge-buteler-coach.facuarg49.workers.dev',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
})
