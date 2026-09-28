import Aura from '@primeuix/themes/aura'
import { createVueform } from '@vueform/primevue/full'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import { createSSRApp } from 'vue'
import config from '../vueform.config'
import App from './App.vue'
import 'primeicons/primeicons.css'

// Shared between the server and client entries so both sides build the
// exact same app (the SSR contract).
export function createApp() {
  const app = createSSRApp(App)
  app.directive('tooltip', Tooltip)
  app.use(PrimeVue, { theme: { preset: Aura } })
  app.use(createVueform(config))
  return { app }
}
