import Aura from '@primeuix/themes/aura'
import { createVueform } from '@vueform/primevue/full'
import PrimeVue from 'primevue/config'
import { createVaporApp, vaporInteropPlugin, type VaporComponent } from 'vue'

import config from '../vueform.config'
import App from './App.vue'

import 'primeicons/primeicons.css'

// The SFC is vapor-compiled at build time (vite plugin `features.vapor`),
// but vue-language-tools still types it as a vdom component.
const Root = App as unknown as VaporComponent

// The vapor-active guard for the boot spec: a vapor cell that silently fell
// back to vdom compilation must fail, not pass vacuously.
window.__SMOKE_VAPOR_APP__ = (Root as { __vapor?: boolean }).__vapor === true

const app = createVaporApp(Root)

// PrimeVue's components are vdom — they render through the interop plugin.
// Its Tooltip is an object-format directive the vapor runtime can't apply,
// so it stays unregistered here (same as the vapor playground).
app.use(vaporInteropPlugin)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      // Keep PrimeVue's styles in a named layer so vapor-served Vueform
      // styles keep winning the cascade.
      cssLayer: { name: 'primevue', order: 'primevue' },
    },
  },
})
app.use(createVueform(config))

app.mount('#app')
