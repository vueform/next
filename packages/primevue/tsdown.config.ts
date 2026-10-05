import { createAdapterTsdownConfig } from '@vueform/utils'

export default createAdapterTsdownConfig({
  name: '@vueform/primevue',
  alias: '#primevue',
  external: [/^primevue/],
  cdn: true,
})
