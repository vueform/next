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
import * as components from '@/components'
import defaultConfig from '@/config'
import * as modules from '@/modules'
import * as rules from '@/rules'
import { theme } from '@/themes'

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
