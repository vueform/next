import './debug'
import './style.css'
import App from './App.vue'
import { createVaporApp, vaporInteropPlugin } from 'vue'
import { createVueform } from '@vueform/primevue/vapor/full'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'

const app = createVaporApp(App)

app.use(vaporInteropPlugin)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark',
      cssLayer: {
        name: 'primevue',
        order: 'primevue',
      },
    },
  },
})

app.use(
  createVueform({
    darkMode: '.dark',
  })
)

app.mount('#app')
