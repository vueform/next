import { createCoreVaporTsdownConfig } from '@vueform/utils'

// Second build step (`build` script): requires the main tsdown build's dist
// — the vapor components import shared modules from it by relative path.
export default createCoreVaporTsdownConfig({
  name: '@vueform/core',
})
