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
import * as components from '#ui/components/index'
import defaultConfig from '#ui/config'
import * as modules from '#ui/modules/modules'
import * as rules from '#ui/rules'
import { material as theme } from '#ui/themes'

/**
 * Creates a pre-configured Vueform plugin with all components, rules, modules,
 * the Material theme, and the `en_US` locale registered by default. Every
 * config option is optional; `tokens` are merged on top of the Material base
 * theme.
 */
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
