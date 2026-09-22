import { defineConfig } from '@vueform/ui'
import exprEval from '@vueform/expr-eval'

export default defineConfig({
  plugins: [exprEval()],
  darkMode: '.dark',
})
