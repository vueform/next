import vue from '@vitejs/plugin-vue'
import { vueformDev } from '../../vite.dev'
import { defineConfig } from 'vite'

// The app imports the `./vapor` subpaths (`@vueform/ui/vapor/origin` etc.).
// In dev, vfdev strips the `/vapor` segment and serves source. DIST=1
// disables vfdev, so the imports resolve to the built `dist/vapor` through
// the real exports maps — used to verify the actual packaging.
const dist = !!process.env.DIST

export default defineConfig({
  plugins: [
    // Everything — the app's SFCs and (in dev) Vueform's source SFCs — is
    // vapor-compiled: this playground is 100% vapor.
    vue({ features: { vapor: true } }),
    ...(dist ? [] : [vueformDev('ui')]),
  ],
  resolve: {
    // vfdev aliases @vueform/* to packages/*/src, whose `vue` imports would
    // otherwise resolve to the workspace root's 3.5 copy. Force every `vue`
    // import to resolve to this playground's 3.6 (Vapor) build instead.
    dedupe: ['vue'],
  },
})
