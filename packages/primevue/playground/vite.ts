/**
 * Playground fragment: extra Vite plugins the primevue adapter needs. Copied
 * into a generated playground as `vite.adapter.ts` by pg:up.
 */
import type { Plugin } from 'vite'

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

/**
 * Dedupe the stateful prime packages in Rollup builds. The playground and the
 * linked `@vueform/primevue` dist resolve `primevue/*` to different physical
 * copies (playground vs workspace-root node_modules), so `vite build` bundles
 * two `@primeuix/styled` Theme singletons: `setTheme()` fills one while
 * component style loaders read the other, leaving `--p-*` variables empty.
 * (`sharePrimeuixStyled` only covers dev prebundling.)
 */
function dedupePrime(): Plugin {
  return {
    name: 'vueform:dedupe-prime',
    config() {
      return {
        resolve: {
          dedupe: [
            'primevue',
            '@primevue/core',
            '@primeuix/styled',
            '@primeuix/themes',
          ],
        },
      }
    },
  }
}

export function vitePlugins(mode: { vapor: boolean }): Plugin[] {
  return [dedupePrime(), ...(mode.vapor ? [sharePrimeuixStyled()] : [])]
}
