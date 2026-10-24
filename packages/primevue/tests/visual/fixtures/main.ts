import './style.css'
import 'primeicons/primeicons.css'
import Aura from '@primeuix/themes/aura'
import exprEval from '@vueform/expr-eval'
import { createVueform } from '@vueform/primevue/bundle'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import { createApp } from 'vue'

import App from './App.vue'

const app = createApp(App)

app.directive('tooltip', Tooltip)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark',
      cssLayer: { name: 'primevue', order: 'primevue' },
    },
  },
})

app.use(
  createVueform({
    darkMode: '.dark',
    languages: {
      en_US: 'English',
      nl_NL: 'Dutch',
    },
    plugins: [exprEval()],
  })
)

app.mount('#app')
