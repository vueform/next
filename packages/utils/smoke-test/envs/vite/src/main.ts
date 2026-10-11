import { createApp } from 'vue'

import { createVueform } from '../smoke/adapter'
import { setupApp } from '../smoke/setup/vite'
import config from '../vueform.config'
import App from './App.vue'

const app = createApp(App)

setupApp(app, { mode: 'vdom' })
app.use(createVueform(config))

app.mount('#app')
