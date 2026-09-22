import './debug'
import './style.css'
import App from './App.vue'
import { createVaporApp } from 'vue'
import { createVueform } from '@vueform/ui/vapor/origin'

createVaporApp(App)
  .use(
    createVueform({
      darkMode: '.dark',
    })
  )
  .mount('#app')
