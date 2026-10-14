/**
 * Re-export of the shared warm-up — see scripts/ensure-utils.ts. The
 * playground entries call this before dynamically importing `./lib` (which
 * imports `@vueform/utils` from its dist).
 */
export { ensureUtilsDist } from '../ensure-utils'
