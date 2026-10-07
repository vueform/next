import { createAdapterVaporTsdownConfig } from '@vueform/utils'

// Second build step (`build` script): requires the main tsdown build's dist
// — the vapor tree imports shared modules from it by relative path.
export default createAdapterVaporTsdownConfig({
  name: '@vueform/primevue',
  external: [/^primevue/],
})
