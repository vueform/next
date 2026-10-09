// A plain consumer Nuxt app: the @vueform/nuxt module does all wiring
// (plugin, components, type template). No dev plugin, no source aliases.
// Which adapter — the only adapter-specific bit — comes from the
// harness-generated run metadata.
import { adapter } from './smoke/run-meta'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-27',
  telemetry: false,
  devtools: { enabled: false },
  // The nuxt-spa cell rebuilds this same fixture with SMOKE_NUXT_SSR=false.
  ssr: process.env.SMOKE_NUXT_SSR !== 'false',
  modules: ['@vueform/nuxt'],
  vueform: {
    adapter,
    locales: ['en_US'],
    // The tarball is preinstalled; the module must never try to install it.
    installAdapter: 'never',
  },
})
