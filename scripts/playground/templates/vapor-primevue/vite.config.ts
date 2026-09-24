import vue from '@vitejs/plugin-vue'
import { vueformDev } from '../../vite.dev'
import { defineConfig, type Plugin } from 'vite'

// The app imports the `./vapor` subpaths (`@vueform/primevue/vapor/full`
// etc.). In dev, vfdev strips the `/vapor` segment and serves source. DIST=1
// disables vfdev, so the imports resolve to the built `dist/vapor` through
// the real exports maps — used to verify the actual packaging.
const dist = !!process.env.DIST

/**
 * Force every optimized primevue/* entry to import the shared
 * `@primeuix/styled` prebundle instead of inlining Theme. Without this,
 * `Theme.setTheme()` from `primevue/config` never reaches component style
 * loaders and CSS variables (e.g. `--p-inputtext-*`) stay empty.
 */
function sharePrimeuixStyled(): Plugin {
  return {
    name: 'vueform:share-primeuix-styled',
    config() {
      return {
        optimizeDeps: {
          include: ['@primeuix/styled'],
          esbuildOptions: {
            plugins: [
              {
                name: 'externalize-primeuix-styled',
                setup(build) {
                  build.onResolve({ filter: /^@primeuix\/styled$/ }, (args) => {
                    // Keep the dedicated `@primeuix/styled` optimizeDeps
                    // entry bundling itself; only externalize when another
                    // entry (e.g. primevue/config) imports it.
                    if (args.kind === 'entry-point') return undefined
                    return { path: '@primeuix/styled', external: true }
                  })
                },
              },
            ],
          },
        },
      }
    },
  }
}

export default defineConfig({
  define: {
    // Selects the vapor function form of shared dual-mode directives when
    // serving package source via vfdev.
    __VUEFORM_VAPOR__: JSON.stringify(true),
  },
  plugins: [
    // Vueform SFCs are vapor-compiled; PrimeVue stays VDOM and is hosted
    // under vaporInteropPlugin (see main.ts).
    vue({ features: { vapor: true } }),
    ...(dist ? [] : [vueformDev('primevue')]),
    sharePrimeuixStyled(),
  ],
  resolve: {
    // vfdev aliases @vueform/* to packages/*/src, whose `vue` imports would
    // otherwise resolve to the workspace root's 3.5 copy. Force every `vue`
    // import to resolve to this playground's 3.6 (Vapor) build instead.
    dedupe: ['vue', '@primeuix/styled', '@primevue/core', 'primevue'],
  },
})
