import { createAdapterConfig } from '@vueform/utils'

export default createAdapterConfig({
  name: '@vueform/primevue',
  alias: '#primevue',
  external: [/^primevue/],
  cdn: true,
  vapor: true,
})
