import { defineModule } from '#core/helpers'

import { createTheme, getCSS, injectThemeCss } from './createTheme'

/**
 * The theme module. Register via `createVueform({ modules: { theme } })`.
 */
export const theme = defineModule({
  create: ({ vueform }) => createTheme(vueform),
  install: ({ app, vueform }) => {
    injectThemeCss(app, vueform)
  },
  getCSS: ({ vueform }) => getCSS(vueform),
})
