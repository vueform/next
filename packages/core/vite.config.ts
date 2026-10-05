import { fileURLToPath } from 'node:url'
import { createCoreConfig } from '@vueform/utils'

export default createCoreConfig({
  dir: fileURLToPath(new URL('.', import.meta.url)),
  name: '@vueform/core',
  alias: '#core',
  external: ['@vue/devtools-api'],
  vapor: true,
})
