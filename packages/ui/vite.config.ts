import { fileURLToPath } from 'node:url'
import { createAdapterConfig } from '@vueform/utils'

export default createAdapterConfig({
  dir: fileURLToPath(new URL('.', import.meta.url)),
  name: '@vueform/ui',
  alias: '#ui',
  cdn: true,
  vapor: true,
})
