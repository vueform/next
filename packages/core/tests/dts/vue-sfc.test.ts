/**
 * Named-test reporting for the SFC template type tests in this directory — see
 * `vueSfcTypeTests` in `@vueform/utils/type-test` for the mechanism (one
 * vue-tsc run over `tsconfig.vue.json`, diagnostics mapped to a test per ✅/❌
 * template marker).
 */
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { vueSfcTypeTests } from '@vueform/utils/type-test'

vueSfcTypeTests({ dir: dirname(fileURLToPath(import.meta.url)) })
