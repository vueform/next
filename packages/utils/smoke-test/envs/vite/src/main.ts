import { createApp } from 'vue'

import { createVueform } from '../smoke/adapter'
import config from '../vueform.config'
import App from './App.vue'

createApp(App).use(createVueform(config)).mount('#app')
