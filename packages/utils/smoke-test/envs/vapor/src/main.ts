import { createVaporApp, type VaporComponent } from 'vue'

import { createVueform } from '../smoke/adapter'
import config from '../vueform.config'
import App from './App.vue'

// The SFC is vapor-compiled at build time (vite plugin `features.vapor`),
// but vue-language-tools still types it as a vdom component.
const Root = App as unknown as VaporComponent

// The vapor-active guard for the boot spec: a vapor cell that silently fell
// back to vdom compilation must fail, not pass vacuously.
window.__SMOKE_VAPOR_APP__ = (Root as { __vapor?: boolean }).__vapor === true

const app = createVaporApp(Root)

app.use(createVueform(config))

app.mount('#app')
