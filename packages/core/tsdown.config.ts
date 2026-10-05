import { createCoreTsdownConfig } from '@vueform/utils'

export default createCoreTsdownConfig({
  name: '@vueform/core',
  alias: '#core',
  external: ['@vue/devtools-api'],
})
