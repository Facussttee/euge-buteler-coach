import { defineConfig } from 'astro/config'

export default defineConfig({
  site: process.env.CF_PAGES_URL || undefined,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
})
