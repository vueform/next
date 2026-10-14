import { createSSRApp } from 'vue'

import { createVueform } from '../smoke/adapter'
import { setupApp } from '../smoke/setup/vite'
import config from '../vueform.config'
import App from './App.vue'

// Shared between the server and client entries so both sides build the
// exact same app (the SSR contract).
export function createApp() {
  const app = createSSRApp(App)
  setupApp(app, { mode: 'vdom' })
  app.use(createVueform(config))
  return { app }
}
