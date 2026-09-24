import { vueformDev } from '../../vite.dev'
import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-27',
  devtools: { enabled: true },
  telemetry: false,
  modules: ['@primevue/nuxt-module', '@vueform/primevue/nuxt'],
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
  vueform: {
    locales: ['en_US'],
  },
  vite: {
    plugins: [vueformDev('primevue')],
  },
})
