import { createCoreConfig } from '@vueform/utils'

export default createCoreConfig({
  name: '@vueform/core',
  alias: '#core',
  external: ['@vue/devtools-api'],
  vapor: true,
})
