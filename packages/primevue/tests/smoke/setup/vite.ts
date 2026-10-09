import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import * as Vue from 'vue'
import type { App, Plugin } from 'vue'

import 'primeicons/primeicons.css'

export function setupApp(app: App, { mode }: { mode: 'vdom' | 'vapor' }) {
  if (mode === 'vapor') {
    // PrimeVue's components are vdom — they render through the interop
    // plugin. Namespace access on purpose: the plugin only exists in the
    // vapor vue build, and this file is also compiled in vue 3.5 envs.
    const { vaporInteropPlugin } = Vue as unknown as {
      vaporInteropPlugin: Plugin
    }
    app.use(vaporInteropPlugin)
    // Tooltip is an object-format directive the vapor runtime can't apply —
    // it stays unregistered (same as the vapor playground). PrimeVue's
    // styles go in a named layer so vapor-served Vueform styles keep
    // winning the cascade.
    app.use(PrimeVue, {
      theme: {
        preset: Aura,
        options: { cssLayer: { name: 'primevue', order: 'primevue' } },
      },
    })
    return
  }

  app.directive('tooltip', Tooltip)
  app.use(PrimeVue, { theme: { preset: Aura } })
}
