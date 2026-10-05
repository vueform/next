import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import '@vueform/primevue/theme.css'
import './index.scss'

import { createVueform, defaultConfig } from '@vueform/primevue'
import * as components from '@vueform/primevue/components'
import * as modules from '@vueform/primevue/modules'
import * as rules from '@vueform/primevue/rules'
import { theme } from '@vueform/primevue/themes'
import PrimeVue from 'primevue/config'
import InputIcon from 'primevue/inputicon'
import Tooltip from 'primevue/tooltip'
import type { AdapterEntry } from '../types'


const entry: AdapterEntry = {
  components,
  rules,
  modules,
  createVueform,
  defaultConfig,
  theme,
  install(app) {
    app.use(PrimeVue, {
      theme: {
        preset: definePreset(Aura, {
          semantic: {
            primary: {
              50: '{indigo.50}',
              100: '{indigo.100}',
              200: '{indigo.200}',
              300: '{indigo.300}',
              400: '{indigo.400}',
              500: '{indigo.500}',
              600: '{indigo.600}',
              700: '{indigo.700}',
              800: '{indigo.800}',
              900: '{indigo.900}',
              950: '{indigo.950}',
            },
          },
        }),
        options: {
          darkModeSelector: '.dark',
        },
      },
    })
    app.component('InputIcon', InputIcon)
    app.directive('tooltip', Tooltip)
  },
}

export default entry
