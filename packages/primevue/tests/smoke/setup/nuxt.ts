import Aura from '@primeuix/themes/aura'

export default {
  modules: ['@primevue/nuxt-module'],
  css: ['primeicons/primeicons.css'],
  primevue: {
    options: {
      theme: { preset: Aura },
    },
  },
}
