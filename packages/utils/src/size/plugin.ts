import { adapterFullEntry } from './adapter'
import type { Scenario, SizeConfig } from './types'

/**
 * The plugin suite measures what the plugin adds on top of a full `@vueform/ui`
 * build (every element, no plugins), with a matched dep-only reference build so
 * the report can split the delta into the plugin's own code and its third-party
 * dependency.
 *
 * The plugin describes its dependency in its manifest's `vueform.size`: `dep`
 * (the package), `depImport` (an import line for it) and `depRetain` (a
 * statement using it so the bundler retains it).
 */
export function pluginScenarios(
  pkg: string,
  config: SizeConfig,
  ui: { dir: string; pkg: string; config: SizeConfig }
): Scenario[] {
  const short = pkg.replace('@vueform/', '')
  // Default-import identifier for the plugin ('expr-eval' → 'exprEval').
  const id = short.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())

  if (!config.dep || !config.depImport || !config.depRetain) {
    throw new Error(
      `${pkg} is missing its size-suite config — set "vueform": { "size": { "dep", "depImport", "depRetain" } } in its package.json.`
    )
  }

  const fullEntry = (extras?: Parameters<typeof adapterFullEntry>[3]) =>
    adapterFullEntry(ui.dir, ui.pkg, ui.config, extras)

  return [
    {
      name: 'baseline',
      group: 'fixed',
      description: `full ${ui.pkg} build with every element, no plugins`,
      entry: fullEntry(),
    },
    {
      name: `with-${short}`,
      group: 'plugin',
      plugin: pkg,
      dep: config.dep,
      pv: `dep-${short}`,
      description: `baseline + the ${pkg} plugin (bundles ${config.dep})`,
      entry: fullEntry({
        imports: [`import ${id} from '${pkg}'`],
        config: [`plugins: [${id}()],`],
      }),
    },
    {
      name: `dep-${short}`,
      group: 'pv',
      description: `baseline + raw ${config.dep} only, no Vueform plugin`,
      entry: fullEntry({
        imports: [config.depImport],
        statements: [config.depRetain],
      }),
    },
  ]
}
