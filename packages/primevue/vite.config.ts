import { fileURLToPath } from 'node:url'
import { createAdapterConfig } from '@vueform/utils'

export default createAdapterConfig({
  dir: fileURLToPath(new URL('.', import.meta.url)),
  name: '@vueform/primevue',
  alias: '#primevue',
  external: [/^primevue/],
  cdn: true,
  vapor: true,
})
