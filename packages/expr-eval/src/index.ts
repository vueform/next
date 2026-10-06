import { definePlugin } from '@vueform/core'

import { exprEvalAdapter } from './adapter'

export * from './functions'
export * from './helpers'
export * from './adapter'

export default definePlugin(() => ({
  name: 'expr-eval',
  config(config) {
    config.$expression = {
      ...config.$expression,
      adapter: config.$expression?.adapter ?? exprEvalAdapter,
    }
  },
}))
