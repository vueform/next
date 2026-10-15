import { definePlugin, own } from '@vueform/core'

import { devtools } from './definition'

export * from './createDevtools'
export * from './definition'

export default definePlugin(() => ({
  name: 'devtools',
  config(config) {
    // A literal `process.env.NODE_ENV` guard, not `isDev()`: bundlers replace
    // the expression in place, so production builds see a statically false
    // branch and drop the registration — and with it the module, the lazy
    // inspector chunk and `@vue/devtools-api` — from the bundle entirely.
    if (process.env.NODE_ENV !== 'production') {
      // Registered as an OWN-property read so a polluted
      // `Object.prototype.devtools` can never pose as — or suppress — the
      // module; an explicitly registered `modules.devtools` keeps winning.
      config.modules = {
        ...config.modules,
        devtools: own(config.modules, 'devtools') ?? devtools,
      }
    }
  },
}))
