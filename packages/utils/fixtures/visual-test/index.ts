/**
 * Shared tabular-layout tester components for the packages' visual (screenshot)
 * suites. A raw-source asset directory (like `smoke-test`), outside `src` and
 * shipped uncompiled on purpose: the testers import `@vueform/core` (building
 * them here would create a utils ⇄ core build cycle), and raw `.vue` stays
 * render-mode agnostic — the consuming fixture's Vite compiles them for
 * whichever mode (vdom/vapor) it targets.
 */
export {
  default as TabularGridTester,
  countries,
  defaultBindings,
  defaultTypes,
} from './TabularGridTester.vue'

export { default as TabularMatrixTester } from './TabularMatrixTester.vue'
