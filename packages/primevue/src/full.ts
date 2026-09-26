import './components'
import './themes'
import {
  createVueformFactory,
  defineConfig,
  fetchHttpAdapter,
  nativeDateAdapter,
  pathExpressionAdapter,
} from '@vueform/core'
import { en_US } from '@vueform/core/locales'
import * as components from '#primevue/components'
import defaultConfig from '#primevue/config'
import * as modules from '#primevue/modules/modules'
import * as rules from '#primevue/rules'
import { theme } from '#primevue/themes'

export const createVueform = createVueformFactory(
  defineConfig({
    ...defaultConfig,
    $date: { adapter: nativeDateAdapter },
    $http: { adapter: fetchHttpAdapter },
    $expression: { adapter: pathExpressionAdapter },
    components,
    rules,
    modules,
    theme,
    locales: { en_US },
    locale: 'en_US',
  })
)
