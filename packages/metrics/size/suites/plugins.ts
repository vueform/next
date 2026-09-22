import { uiFullEntry } from './ui'
import type { Scenario } from '../lib/types'

interface PluginDef {
  /**
   * Plugin name, also the directory under packages/.
   */
  name: string
  /**
   * Package to import the Vueform plugin from.
   */
  pkg: string
  /**
   * Identifier used for the plugin's default import in generated entries.
   */
  id: string
  /**
   * The heavy third-party dependency the plugin wraps.
   */
  dep: string
  /**
   * Import line for the raw dependency (dep-only reference scenarios).
   */
  depImport: string
  /**
   * Statement that uses the dependency so the bundler retains it.
   */
  depRetain: string
}

/**
 * To measure a new plugin, add it here and add its package + third-party
 * dependency to bundle-size/package.json.
 */
const PLUGINS: PluginDef[] = [
  {
    name: 'dompurify',
    pkg: '@vueform/dompurify',
    id: 'dompurify',
    dep: 'isomorphic-dompurify',
    depImport: `import DOMPurify from 'isomorphic-dompurify'`,
    depRetain: `console.log(DOMPurify.sanitize('<b>vueform</b>'))`,
  },
  {
    name: 'expr-eval',
    pkg: '@vueform/expr-eval',
    id: 'exprEval',
    dep: 'expr-eval-fork',
    depImport: `import { Parser } from 'expr-eval-fork'`,
    depRetain: `console.log(Parser.evaluate('1 + 2'))`,
  },
]

/**
 * Package directories (under packages/) whose dist artifacts the plugins suite
 * builds against.
 */
export const pluginsPackages = ['ui', ...PLUGINS.map((plugin) => plugin.name)]

export function pluginsScenarios(monorepoRoot: string): Scenario[] {
  const baseline: Scenario = {
    name: 'baseline',
    group: 'fixed',
    description: 'full @vueform/ui build with every element, no plugins',
    entry: uiFullEntry(monorepoRoot),
  }

  const perPlugin: Scenario[] = PLUGINS.flatMap((plugin) => [
    {
      name: `with-${plugin.name}`,
      group: 'plugin' as const,
      plugin: plugin.pkg,
      dep: plugin.dep,
      pv: `dep-${plugin.name}`,
      description: `baseline + the ${plugin.pkg} plugin (bundles ${plugin.dep})`,
      entry: uiFullEntry(monorepoRoot, {
        imports: [`import ${plugin.id} from '${plugin.pkg}'`],
        config: [`plugins: [${plugin.id}()],`],
      }),
    },
    {
      name: `dep-${plugin.name}`,
      group: 'pv' as const,
      description: `baseline + raw ${plugin.dep} only, no Vueform plugin`,
      entry: uiFullEntry(monorepoRoot, {
        imports: [plugin.depImport],
        statements: [plugin.depRetain],
      }),
    },
  ])

  return [baseline, ...perPlugin]
}
