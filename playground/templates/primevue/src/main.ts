import './debug'
import './style.css'
import App from './App.vue'
import { createApp } from 'vue'
import { createVueform } from '@vueform/primevue/full'
import exprEval from '@vueform/expr-eval'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import Tooltip from 'primevue/tooltip'
import 'primeicons/primeicons.css'

const app = createApp(App)

app.directive('tooltip', Tooltip)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark',
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
