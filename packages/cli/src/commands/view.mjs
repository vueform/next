import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { loadItem, loadRegistry, suggestItems } from '../registry.mjs'
import { canSelect, selectFrom } from '../select.mjs'

function looksLikeVSCode() {
  return (
    process.env.TERM_PROGRAM === 'vscode' ||
    !!process.env.VSCODE_GIT_IPC_HANDLE ||
    !!process.env.VSCODE_PID
  )
}

export const view = {
  name: 'view',
  usage: 'view [component]',
  description: "View a copyable component's source before copying it",
  examples: ['vueform view VfText', 'vueform view'],
  async run({ positionals, flags, out }) {
    const [component, ...extra] = positionals

    if (extra.length) {
      out.fail(
        'Expected at most one component name.',
        'Usage: vueform view [component] — see `vueform help view`.'
      )
      return
    }

    const cwd = process.cwd()
    const registry = loadRegistry(cwd)

    if (registry.error) {
      out.fail(
        registry.error === 'no-package'
          ? 'No Vueform package found in this project.'
          : `${registry.package}'s registry is unavailable (${registry.error}).`,
        'Install an adapter (@vueform/ui or @vueform/primevue) first.'
      )
      return
    }

    let name = component

    if (!name) {
      if (!canSelect()) {
        out.fail(
          'No component given and this is not an interactive terminal.',
          'Usage: vueform view <component> — see `vueform list`.'
        )
        return
      }

      name = await selectFrom(
        `Components in ${registry.package}:`,
        registry.index.items.map((item) => ({
          name: item.name,
          hint: item.description,
        }))
      )

      if (!name) {
        out.log('Cancelled.')
        return
      }
    }

    const item = loadItem(registry, name)

    if (!item) {
      const suggestions = suggestItems(registry, name)
      out.fail(
        `${name} is not in ${registry.package}'s registry.`,
        suggestions.length
          ? `Did you mean: ${suggestions.join(', ')}? See \`vueform list\`.`
          : 'See `vueform list` for available components.'
      )
      return
    }

    const files = (item.files ?? []).map((file) => ({
      name: file.path,
      abs: path.join(registry.dir, 'copies', file.path),
    }))

    // Inside an editor terminal, open the registry source directly instead of
    // dumping it; fall back to the dump anywhere else (or when opening fails).
    if (looksLikeVSCode() && flags.silent !== true) {
      const result = spawnSync('code', [...files.map((file) => file.abs)], {
        stdio: 'ignore',
      })

      if (result.status === 0) {
        out.log(
          `Opened ${files.map((file) => file.name).join(', ')} from ${registry.package} in your editor.`
        )
        return
      }
    }

    for (const file of files) {
      out.log(
        `\n── ${file.name} ${'─'.repeat(Math.max(3, 40 - file.name.length))}\n`
      )
      out.log(readFileSync(file.abs, 'utf8').trimEnd())
    }
  },
}
