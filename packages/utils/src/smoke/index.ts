/**
 * The smoke harness (`@vueform/utils/smoke`): proves the packed tarballs of the
 * adapters work in real project setups. Each adapter exposes it as a two-line
 * `tests/smoke/run.ts`; see cli.ts for the flag model and envs.ts for the env
 * matrix.
 */
export { runSmokeCli, type SmokeCliOptions } from './cli'
export {
  ENVS,
  type EnvDef,
  type Framework,
  type Pm,
  type Rendering,
  type SfcMode,
} from './envs'
export { packWorkspace, type PackedTarballs, type PackOptions } from './pack'
export { runEnv, type EnvResult, type EnvRunInput } from './runner'
export { SmokeError } from './lib'
