import { defineModule } from '#src/helpers'

import { createDevtools } from './createDevtools'

/**
 * The devtools module. Register via `createVueform({ modules: { devtools } })`.
 * Development-only: in production builds, and with `devtools: false` in the
 * config, it stays inert — so it is safe to register unconditionally.
 */
export const devtools = defineModule({
  create: ({ vueform }) => createDevtools(vueform),
  install: ({ app, vueform }) => {
    vueform.modules.devtools?.setupInspector(app)
  },
})
