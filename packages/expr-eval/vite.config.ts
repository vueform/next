import { fileURLToPath } from 'node:url'
import { createPluginConfig } from '@vueform/utils'

export default createPluginConfig({
  dir: fileURLToPath(new URL('.', import.meta.url)),
  name: '@vueform/expr-eval',
  external: ['expr-eval-fork'],
})
