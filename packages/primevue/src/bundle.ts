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

import * as components from '#src/components'
import defaultConfig from '#src/config'
import * as modules from '#src/modules/modules'
import * as rules from '#src/rules'
import { theme } from '#src/themes'

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
  })
)
