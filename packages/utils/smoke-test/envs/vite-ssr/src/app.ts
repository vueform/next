import { createSSRApp } from 'vue'

import { createVueform } from '../smoke/adapter'
import config from '../vueform.config'
import App from './App.vue'

// Shared between the server and client entries so both sides build the
// exact same app (the SSR contract).
export function createApp() {
  const app = createSSRApp(App)
  app.use(createVueform(config))
  return { app }
}
