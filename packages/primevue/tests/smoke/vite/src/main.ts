import Aura from '@primeuix/themes/aura'
import { createVueform } from '@vueform/primevue/full'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import { createApp } from 'vue'
import config from '../vueform.config'
import App from './App.vue'
import 'primeicons/primeicons.css'

const app = createApp(App)

app.directive('tooltip', Tooltip)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(createVueform(config))

app.mount('#app')
