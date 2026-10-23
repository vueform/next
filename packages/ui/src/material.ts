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

import * as components from '#src/components/index'
import defaultConfig from '#src/config'
import * as modules from '#src/modules/modules'
import * as rules from '#src/rules'
import { material as theme } from '#src/themes'

/**
 * Creates a pre-configured Vueform plugin with all components, rules, modules,
 * the Material theme, and the `en_US` locale registered by default. Every
 * config option is optional; `tokens` are merged on top of the Material base
 * theme.
 */
export const createVueform = createVueformFactory(
  defineConfig({
    ...defaultConfig,
    $date: { ...defaultConfig.$date, adapter: nativeDateAdapter },
    $http: { ...defaultConfig.$http, adapter: fetchHttpAdapter },
    $expression: {
      ...defaultConfig.$expression,
      adapter: pathExpressionAdapter,
    },
    components,
    rules,
    modules,
    theme,
    locales: { en_US },
    locale: 'en_US',
  })
)
