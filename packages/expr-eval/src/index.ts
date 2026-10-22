import { definePlugin, pathExpressionAdapter } from '@vueform/core'

import { exprEvalAdapter } from './adapter'

export * from './functions'
export * from './helpers'
export * from './adapter'

export default definePlugin(() => ({
  name: 'expr-eval',
  config(config) {
    // Entries bake `pathExpressionAdapter` into the config as a fallback, and
    // that default is merged in before plugin hooks run — treat it as
    // replaceable, otherwise installing this plugin on such an entry would be
    // a no-op. Any other adapter is an explicit app choice and wins.
    const adapter = config.$expression?.adapter

    config.$expression = {
      ...config.$expression,
      adapter:
        adapter && adapter !== pathExpressionAdapter
          ? adapter
          : exprEvalAdapter,
    }
  },
}))
