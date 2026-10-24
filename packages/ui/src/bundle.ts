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
import { primary as theme } from '#src/themes'

/**
 * Creates a pre-configured Vueform plugin with all components, rules, modules,
 * the default (Primary) theme, and the `en_US` locale registered by default.
 * Every config option is optional; app `tokens` merge on top of the default
 * theme, and a `theme` replaces it wholesale.
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
  })
)
