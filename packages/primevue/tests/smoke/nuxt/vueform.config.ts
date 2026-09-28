import exprEval from '@vueform/expr-eval'
import { defineConfig } from '@vueform/primevue'

// A representative user config: one real plugin package, nothing else.
// The @vueform/nuxt module picks this file up by convention.
export default defineConfig({
  plugins: [exprEval()],
})
