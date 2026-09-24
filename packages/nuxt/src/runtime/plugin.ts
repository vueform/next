import { defineNuxtPlugin } from '#imports'
import createPlugin from '#vueform-resolved-config'

export default defineNuxtPlugin({
  name: 'vueform',
  enforce: 'pre',
  setup(nuxtApp) {
    nuxtApp.vueApp.use(createPlugin() as any)
  },
})
