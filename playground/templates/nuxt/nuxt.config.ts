import { vueformDev } from '../../../playground/vite.dev'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-27',
  devtools: { enabled: true },
  telemetry: false,
  modules: ['@vueform/ui/nuxt'],
  vueform: {
    theme: 'origin',
    locales: ['hu_HU'],
  },
  vite: {
    plugins: [vueformDev('ui')],
  },
})
