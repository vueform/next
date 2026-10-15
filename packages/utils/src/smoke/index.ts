/**
 * The smoke harness (`@vueform/utils/smoke`): proves the packed tarballs of the
 * adapters work in real project setups. Adapters run it through the `vfd smoke`
 * bin against their canonical `tests/smoke/` content (config.json + the
 * fixtures/ dir of schema, forms and type assertions); see cli.ts for the
 * flag model and envs.ts for the env matrix. The sibling smoke-types suite (`vfd smoke-types` →
 * types-cli.ts/types-envs.ts) typechecks the same fixtures and tarballs as a
 * consumer would, in a separate, smaller env matrix.
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
export { runSmokeTypesCli, type SmokeTypesCliOptions } from './types-cli'
export {
  MIN_TYPESCRIPT,
  TYPE_ENVS,
  type TypeEnvDef,
  type TypesCheck,
} from './types-envs'
export {
  runTypesEnv,
  type TypesEnvResult,
  type TypesEnvRunInput,
} from './types-runner'
export { SmokeError } from './lib'
