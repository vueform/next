import { createAdapterTsdownConfig } from '@vueform/utils'

export default createAdapterTsdownConfig({
  name: '@vueform/primevue',
  external: [/^primevue/],
  cdn: true,
})
