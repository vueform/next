import './style.css'
import exprEval from '@vueform/expr-eval'
import { createVueform } from '@vueform/ui/origin'
import { createApp } from 'vue'

import App from './App.vue'

const app = createApp(App)

app.use(
  createVueform({
    darkMode: '.dark',
    languages: {
      en_US: 'English',
      nl_NL: 'Dutch',
    },
    plugins: [exprEval()],
    icon: (name) =>
      !name
        ? ''
        : name.startsWith('vf-') || name.startsWith('fa-')
          ? name
          : `fa-solid fa-${name}`,
  })
)

app.mount('#app')
