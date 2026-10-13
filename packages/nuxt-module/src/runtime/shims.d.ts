declare module '#imports' {
  export { defineNuxtPlugin } from 'nuxt/app'
}

declare module '#vueform-resolved-config' {
  import type { Plugin } from 'vue'

  const createPlugin: () => Plugin
  export default createPlugin
}

declare module '#vueform-user-config' {
  import type { UserConfig } from '@vueform/core'

  const config: UserConfig
  export default config
}
