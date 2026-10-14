import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// A plain consumer SSR app (no framework): the only cell exercising SSR
// outside Nuxt's transpile/externals handling. No dev plugin, no aliases.
export default defineConfig({
  plugins: [vue()],
})
