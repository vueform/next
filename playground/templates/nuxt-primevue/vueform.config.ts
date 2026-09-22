import { defineConfig } from '@vueform/primevue'
import exprEval from '@vueform/expr-eval'

export default defineConfig({
  plugins: [exprEval()],
})
