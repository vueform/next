import { createVueform } from '@vueform/ui/origin'
import { createApp } from 'vue'

import config from '../vueform.config'
import App from './App.vue'

createApp(App).use(createVueform(config)).mount('#app')
