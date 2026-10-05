// A plain consumer Nuxt 4 app: the @vueform/nuxt module does all wiring
// (plugin, components, type template). No dev plugin, no source aliases.
// The fixture keeps the flat (v3-style) layout — Nuxt 4 detects root-level
// app.vue and keeps srcDir at the root — so the shared `smoke/` content the
// harness injects is part of the app project like in every other cell.
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  telemetry: false,
  devtools: { enabled: false },
  // The nuxt-spa cell rebuilds this same fixture with SMOKE_NUXT_SSR=false.
  ssr: process.env.SMOKE_NUXT_SSR !== 'false',
  modules: ['@vueform/nuxt'],
  vueform: {
    adapter: 'ui',
    locales: ['en_US'],
    // The tarball is preinstalled; the module must never try to install it.
    installAdapter: 'never',
  },
})
