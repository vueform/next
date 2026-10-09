/**
 * Shared tabular-layout tester components for the packages' visual (screenshot)
 * suites. A raw-source asset directory (like `smoke-test`), outside `src`
 * on purpose: tsc can't compile `.vue`, so this package's build never touches
 * it — the `./visual-test` export serves these files as-is and the consuming
 * fixture's Vite compiles them.
 */
export {
  default as TabularGridTester,
  countries,
  defaultBindings,
  defaultTypes,
} from './TabularGridTester.vue'

export { default as TabularMatrixTester } from './TabularMatrixTester.vue'
