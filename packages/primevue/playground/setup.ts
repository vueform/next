/**
 * Playground fragment: app-level wiring the primevue adapter needs. Copied into
 * a generated playground as `src/adapter.setup.ts` by pg:up.
 */
import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import type { App } from 'vue'

import 'primeicons/primeicons.css'

export function installApp(app: App, mode: { vapor: boolean }): void {
  // PrimeVue's Tooltip is a vdom object-format directive; the vapor runtime
  // only applies function directives, so registering it in a vapor app
  // crashes (`dir is not a function`).
  if (!mode.vapor) {
    app.directive('tooltip', Tooltip)
  }

  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.dark',
        // Keep PrimeVue's styles in a named layer so vapor-served Vueform
        // styles keep winning the cascade.
        ...(mode.vapor
          ? { cssLayer: { name: 'primevue', order: 'primevue' } }
          : {}),
      },
    },
  })
}

/**
 * Options merged into `createVueform()` under the user config.
 */
export const vueformConfig = {}
