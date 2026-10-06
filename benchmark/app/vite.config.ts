import path from 'node:path'
import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'

// BENCH_VAPOR=1 builds the vapor variant: the app's SFCs are vapor-compiled
// and the 'vapor' exports condition serves Vueform's vapor dist. Both
// variants install the same Vue 3.6 copy, so the rendering mode is the only
// difference between the two builds — exactly what the mode comparison needs.
const vapor = !!process.env.BENCH_VAPOR

const APP_DIR = path.dirname(fileURLToPath(import.meta.url))

/**
 * TEMPORARY: works around a gap in the packaged vapor dist. The vapor rebuild
 * covers `src/components` only, so `helpers/VfPassthrough.vue` ships
 * vdom-compiled and the vapor components' `<component :is>` chains fail on it
 * ("setup() returned non-block value"), rendering no elements. This redirects
 * the vapor components' `helpers/index.mjs` import to a shim that re-exports
 * the real helpers with a vapor-compiled copy of the identical component —
 * exactly what a fixed dist would contain. Drop this plugin (and src/shims/)
 * once the vapor dist ships its own VfPassthrough.
 */
function vaporPassthroughShim(): Plugin {
  const shim = path.join(APP_DIR, 'src/shims/core-helpers.ts')

  return {
    name: 'bench:vapor-passthrough-shim',
    enforce: 'pre',
    resolveId(source, importer) {
      if (
        importer &&
        /@vueform[+/]core.*\/dist\/vapor\//.test(importer) &&
        source.endsWith('/helpers/index.mjs')
      ) {
        const real = path.resolve(path.dirname(importer), source)
        return `${shim}?real=${encodeURIComponent(real)}`
      }
    },
    load(id) {
      if (!id.startsWith(`${shim}?real=`)) return
      const real = decodeURIComponent(id.slice(`${shim}?real=`.length))
      return (
        `export * from ${JSON.stringify(real)}\n` +
        `export { default as VfPassthrough } from ${JSON.stringify(
          path.join(APP_DIR, 'src/shims/VfPassthrough.vue')
        )}\n`
      )
    },
  }
}

export default defineConfig({
  base: './',
  define: {
    __BENCH_VAPOR__: JSON.stringify(vapor),
  },
  plugins: [
    ...(vapor ? [vaporPassthroughShim()] : []),
    vue(vapor ? { features: { vapor: true } } : {}),
  ],
  resolve: {
    ...(vapor ? { conditions: ['vapor'] } : {}),
    dedupe: ['vue'],
  },
  build: {
    outDir: vapor ? 'dist/vapor' : 'dist/vdom',
    emptyOutDir: true,
  },
})
