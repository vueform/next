import Aura from '@primeuix/themes/aura'

// A plain consumer Nuxt 3 app: @primevue/nuxt-module wires PrimeVue itself and
// @vueform/nuxt wires Vueform. No dev plugin, no source aliases.
export default defineNuxtConfig({
  compatibilityDate: '2025-05-27',
  telemetry: false,
  devtools: { enabled: false },
  // The nuxt3-spa cell rebuilds this same fixture with SMOKE_NUXT_SSR=false.
  ssr: process.env.SMOKE_NUXT_SSR !== 'false',
  modules: ['@primevue/nuxt-module', '@vueform/nuxt'],
  css: ['primeicons/primeicons.css'],
  primevue: {
    options: {
      theme: { preset: Aura },
    },
  },
  vueform: {
    adapter: 'primevue',
    locales: ['en_US'],
    // The tarball is preinstalled; the module must never try to install it.
    installAdapter: 'never',
  },
})
