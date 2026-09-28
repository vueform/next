/**
 * The smoke harness (`@vueform/utils/smoke`): proves the packed tarballs of
 * the adapters work in real project setups. Each adapter exposes it as a
 * two-line `tests/smoke/run.ts`; see cli.ts for the flag model and cells.ts
 * for the cell matrix.
 */
export { runSmokeCli, type SmokeCliOptions } from './cli'
export {
  CELLS,
  filterCells,
  type CellDef,
  type CellFilters,
  type Env,
  type Pm,
  type Rendering,
  type SfcMode,
} from './cells'
export { packWorkspace, type PackedTarballs } from './pack'
export { runCell, summarize, type CellResult, type CellRunInput } from './runner'
export { SmokeError } from './lib'
