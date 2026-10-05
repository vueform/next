import { createPluginTsdownConfig } from '@vueform/utils'

export default createPluginTsdownConfig({
  name: '@vueform/expr-eval',
  external: ['expr-eval-fork'],
})
