import exprEval from '@vueform/expr-eval'
import { defineConfig } from '@vueform/ui'

// A representative user config: one real plugin package, nothing else.
export default defineConfig({
  plugins: [exprEval()],
})
