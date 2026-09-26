/**
 * Playground fragment: extra Nuxt config the primevue adapter needs. Copied
 * into a generated playground as `nuxt.adapter.ts` by pg:up and merged into its
 * nuxt.config (modules are concatenated, other keys shallow-spread).
 */
import Aura from '@primeuix/themes/aura'

export default {
  modules: ['@primevue/nuxt-module'],
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark',
        },
      },
    },
  },
} as Record<string, unknown>
