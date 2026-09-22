import { listComponents } from '../project.mjs'
import { loadRegistry } from '../registry.mjs'

export const list = {
  name: 'list',
  usage: 'list',
  description: 'List the Vueform components available for copying',
  flags: [['--json', 'Output as JSON']],
  examples: ['vueform list', 'vueform list --json'],
  async run({ flags, out }) {
    const registry = loadRegistry(process.cwd())
    let result

    if (!registry.error) {
      result = {
        package: registry.package,
        version: registry.index.version,
        source: 'registry',
        components: registry.index.items.map(({ name, description }) => ({
          name,
          description: description ?? null,
        })),
      }
    } else {
      // No registry (older/unbuilt package) — fall back to scanning the
      // package's component directories.
      const scanned = listComponents(process.cwd())

      if (!scanned) {
        out.fail(
          'No Vueform package found in this project.',
          'Install an adapter (@vueform/ui or @vueform/primevue) first.'
        )
        return
      }

      result = {
        package: scanned.package,
        version: scanned.version,
        source: 'scan',
        components: scanned.components.map((name) => ({
          name,
          description: null,
        })),
      }
    }

    if (flags.json === true) {
      console.log(JSON.stringify(result, null, 2))
      return
    }

    if (!result.components.length) {
      out.fail(
        `No components found in ${result.package}.`,
        'The package may not be built yet.'
      )
      return
    }

    const pad =
      Math.max(...result.components.map(({ name }) => name.length)) + 2
    const note =
      result.source === 'scan' ? ' (scanned — package ships no registry)' : ''

    out.log(
      `${result.components.length} components in ${result.package}@${result.version ?? '?'}${note}:\n`
    )
    out.log(
      result.components
        .map(({ name, description }) =>
          description ? `  ${name.padEnd(pad)}${description}` : `  ${name}`
        )
        .join('\n')
    )
  },
}
