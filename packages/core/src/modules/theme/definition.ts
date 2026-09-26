import { createTheme, getCSS, injectThemeCss } from './createTheme'
import { defineModule } from '#core/helpers'

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
