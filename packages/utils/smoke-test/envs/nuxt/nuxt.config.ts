// A plain consumer Nuxt app: the @vueform/nuxt module does all wiring
// (plugin, components, type template). No dev plugin, no source aliases.
// The adapter-specific bits come from the harness-generated run metadata
// (which adapter) and the adapter's setup/nuxt.ts (extra modules, css, library
// options — adapter modules load before @vueform/nuxt).
import { adapter } from './smoke/run-meta'
import setup from './smoke/setup/nuxt'

export default defineNuxtConfig({
  ...setup,
  compatibilityDate: '2025-05-27',
  telemetry: false,
  devtools: { enabled: false },
  // The nuxt-spa cell rebuilds this same fixture with SMOKE_NUXT_SSR=false.
  ssr: process.env.SMOKE_NUXT_SSR !== 'false',
  modules: [...(setup.modules ?? []), '@vueform/nuxt'],
  vueform: {
    adapter,
    locales: ['en_US'],
    // The tarball is preinstalled; the module must never try to install it.
    installAdapter: 'never',
  },
})
