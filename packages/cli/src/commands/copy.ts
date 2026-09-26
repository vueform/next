import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { writeBarrel } from '../barrel.js'
import {
  CONFIG_FILENAME,
  componentsDirSnippet,
  getConfigValue,
  readComponentsDir,
  recommendDir,
  recordCopies,
  saveComponentsDir,
} from '../config.js'
import { actionLine, type Output } from '../output.js'
import { ask, canPrompt, confirm } from '../prompt.js'
import { concludeRegistration } from '../registration.js'
import {
  loadItem,
  loadRegistry,
  missingImports,
  suggestItems,
} from '../registry.js'
import { canSelect, multiSelectFrom } from '../select.js'
import { runPostCopy, settleFiles } from '../settle.js'
import type {
  Command,
  CopyEntry,
  RegistryError,
  RegistryFile,
  RegistryItem,
} from '../types.js'

function hashContent(content: string) {
  return `sha256:${createHash('sha256').update(content).digest('hex')}`
}

function registryError(registry: RegistryError, out: Output) {
  if (registry.error === 'no-package') {
    out.fail(
      'No Vueform package found in this project.',
      'Install an adapter (@vueform/ui or @vueform/primevue) first.'
    )
  } else if (registry.error === 'no-registry') {
    out.fail(
      `${registry.package} ships no component registry.`,
      'Update the package to a version that ships a registry.'
    )
  } else if (registry.error === 'version') {
    out.fail(
      `${registry.package} uses registry format v${registry.found}, which this CLI doesn't support.`,
      'Update @vueform/cli.'
    )
  } else {
    out.fail(`${registry.package}'s registry index is corrupted.`)
  }
}

export const copy: Command = {
  name: 'copy',
  usage: 'copy [component|all]',
  description: 'Copy Vueform components into your project for customization',
  valueFlags: ['dir'],
  flags: [
    ['--dir <path>', 'Target directory for this run (skips prompts + config)'],
    ['--yes', 'Accept the recommended directory, no prompts'],
    ['--overwrite', 'Overwrite existing files that differ'],
    ['--dry-run', 'Show what would be written without writing'],
  ],
  examples: [
    'vueform copy VfText',
    'vueform copy all',
    'vueform copy',
    'vueform copy VfText --dir src/vueform/components',
    'vueform copy VfText --yes',
    'vueform copy all --overwrite',
  ],
  async run({ positionals, flags, out }) {
    const [component, ...extra] = positionals

    if (extra.length) {
      out.fail(
        'Expected at most one component name (or `all`).',
        'Usage: vueform copy [component|all] — see `vueform help copy`.'
      )
      return
    }

    const cwd = process.cwd()
    const dryRun = flags['dry-run'] === true

    // Resolve the registry and items first — fail fast before any prompts or
    // config writes.
    const registry = loadRegistry(cwd)

    if (registry.error) {
      registryError(registry, out)
      return
    }

    // With no name given, an interactive terminal gets the multi-select picker.
    let selection = null

    if (!component) {
      if (!canSelect()) {
        out.fail(
          'No component given and this is not an interactive terminal.',
          'Usage: vueform copy <component|all> — see `vueform help copy`.'
        )
        return
      }

      selection = await multiSelectFrom(
        `Components in ${registry.package}:`,
        registry.index.items.map((item) => ({
          name: item.name,
          hint: item.description,
        }))
      )

      if (!selection) {
        out.log('Cancelled.')
        return
      }
    }

    let items: RegistryItem[]

    if (selection) {
      items = selection
        .map((name) => loadItem(registry, name))
        .filter((item): item is RegistryItem => item != null)
    } else if (component === 'all' || component === '*') {
      items = registry.index.items
        .map(({ name }) => loadItem(registry, name))
        .filter((item): item is RegistryItem => item != null)

      if (!items.length) {
        out.fail(`${registry.package}'s registry has no components.`)
        return
      }
    } else {
      const item = loadItem(registry, component)

      if (!item) {
        const suggestions = suggestItems(registry, component)
        out.fail(
          `${component} is not in ${registry.package}'s registry.`,
          suggestions.length
            ? `Did you mean: ${suggestions.join(', ')}? See \`vueform list\`.`
            : 'See `vueform list` for available components.'
        )
        return
      }

      items = [item]
    }

    const missing = [
      ...new Set(items.flatMap((item) => missingImports(item, cwd))),
    ]

    if (missing.length) {
      out.fail(
        `The copies import packages that aren't installed: ${missing.join(', ')}.`,
        `Install them first, e.g. \`npm i ${missing.join(' ')}\`.`
      )
      return
    }

    // Resolve the target directory: --dir → config → prompt/--yes (saved).
    const configPath = path.join(cwd, CONFIG_FILENAME)
    const oneOff = typeof flags.dir === 'string'
    const yes = flags.yes === true
    let dir =
      typeof flags.dir === 'string' ? flags.dir.replace(/\/+$/, '') : null

    if (!dir && existsSync(configPath)) dir = readComponentsDir(configPath)

    let saveDir = false

    if (!dir) {
      const recommended = recommendDir(cwd)

      if (yes) {
        if (!recommended) {
          out.fail(
            'No directory could be recommended for this project.',
            'Pass --dir <path> instead of --yes.'
          )
          return
        }

        dir = recommended
      } else {
        if (!canPrompt()) {
          out.fail(
            'No components directory is configured and this is not an interactive terminal.',
            `Pass --dir <path> or --yes, or store it in ${CONFIG_FILENAME} as:\n\n  ${componentsDirSnippet('src/vueform/components')}`
          )
          return
        }

        while (!dir) {
          dir = await ask(
            'Where should Vueform components be stored?',
            recommended
          )
        }

        dir = dir.replace(/\/+$/, '')
      }

      saveDir = !dryRun
    }

    // Plan the writes. A file is up to date when it matches the registry
    // bytes OR the settled baseline recorded at the previous copy (the
    // registry file after the project's own formatting ran over it).
    const prior = (getConfigValue(configPath, 'copies') ?? {}) as Record<
      string,
      CopyEntry
    >
    const plan: {
      item: RegistryItem
      file: RegistryFile
      rel: string
      dest: string
      source: string
      action: string
    }[] = []

    for (const item of items) {
      for (const file of (item.files ?? []).filter((f) => !f.optional)) {
        const rel = file.target.replace('{componentsDir}', dir)
        const dest = path.resolve(cwd, rel)
        const source = path.join(registry.dir, 'copies', file.path)

        if (!existsSync(source)) {
          out.fail(`${registry.package}'s registry is missing ${file.path}.`)
          return
        }

        let action = 'create'

        if (existsSync(dest)) {
          const recorded = prior[item.name]?.files?.[rel]
          const baseline =
            typeof recorded === 'string' ? recorded : (recorded?.hash ?? null)
          const disk = hashContent(readFileSync(dest, 'utf8'))

          action =
            disk === file.hash || disk === baseline ? 'up-to-date' : 'conflict'
        }

        plan.push({ item, file, rel, dest, source, action })
      }
    }

    if (dryRun) {
      out.log(
        plan
          .map(({ rel, action }) => {
            if (action === 'create') return `would create    ${rel}`
            if (action === 'up-to-date') return `up to date      ${rel}`
            return `would overwrite ${rel}${flags.overwrite === true ? '' : ' (needs --overwrite)'}`
          })
          .join('\n')
      )
      return
    }

    // Resolve conflicts — one decision for all of them.
    const conflicts = plan.filter((entry) => entry.action === 'conflict')

    if (conflicts.length) {
      if (flags.overwrite === true) {
        for (const entry of conflicts) entry.action = 'overwrite'
      } else {
        const listed = conflicts.slice(0, 5).map((c) => c.rel)
        const more = conflicts.length - listed.length
        const description =
          listed.join(', ') + (more > 0 ? ` and ${more} more` : '')

        if (!canPrompt()) {
          out.fail(
            `${conflicts.length} file(s) already exist and differ: ${description}.`,
            'Pass --overwrite to replace them.'
          )
          return
        }

        const overwrite = await confirm(
          `${conflicts.length} file(s) exist and differ from the registry version (${description}). Overwrite?`,
          false
        )

        if (!overwrite) {
          out.log('Aborted — nothing was written.')
          return
        }

        for (const entry of conflicts) entry.action = 'overwrite'
      }
    }

    // Write.
    for (const entry of plan) {
      if (entry.action === 'up-to-date') {
        out.log(actionLine('Up to date', entry.rel))
        continue
      }

      mkdirSync(path.dirname(entry.dest), { recursive: true })
      writeFileSync(entry.dest, readFileSync(entry.source))
      out.log(
        actionLine(
          entry.action === 'create' ? 'Created' : 'Overwrote',
          entry.rel
        )
      )
    }

    // Barrel — CLI-owned, regenerated on every copy; it is what the project
    // registers.
    const barrelFile = writeBarrel(
      path.resolve(cwd, dir),
      existsSync(path.join(cwd, 'tsconfig.json'))
    )

    if (barrelFile) out.log(actionLine('Updated', `${dir}/${barrelFile}`))

    // Settle the files this run wrote (copies + barrel) so the project's own
    // tooling won't change them afterwards: the user's postCopy command when
    // configured, otherwise a safe prettier pass (their install, their config,
    // only these files). Provenance hashes are taken from the settled result.
    const written = plan
      .filter((entry) => entry.action !== 'up-to-date')
      .map((entry) => entry.rel)

    if (written.length) {
      if (barrelFile) written.push(`${dir}/${barrelFile}`)

      const postCopy = getConfigValue(configPath, 'postCopy')

      if (typeof postCopy === 'string' && postCopy.trim()) {
        out.log(`postCopy    ${postCopy}`)

        if (!runPostCopy(cwd, postCopy, written)) {
          out.log(
            'The postCopy command failed — recording the files as they are.'
          )
        }
      } else {
        const settled = await settleFiles(
          cwd,
          written.map((rel) => path.resolve(cwd, rel))
        )

        if (settled) {
          out.log(
            `Formatted   ${settled} file(s) with the project prettier config`
          )
        }
      }
    }

    // Auto-registration is only ever offered on the very first copy run —
    // detected before provenance is written.
    const firstRun =
      !getConfigValue(configPath, 'copies') &&
      !getConfigValue(configPath, 'clones') &&
      getConfigValue(configPath, 'autoRegister') === null

    // Record config: componentsDir (when it came from prompt/--yes) and
    // provenance — unless --dir made this a one-off run.
    if (!oneOff) {
      const savedDir = saveDir ? saveComponentsDir(configPath, dir) : null

      const entries: Record<string, CopyEntry> = {}

      for (const item of items) {
        const fileHashes: CopyEntry['files'] = {}
        for (const entry of plan) {
          if (entry.item === item) {
            // `hash` describes the file as it landed (post-settle) — the
            // baseline for modified/conflict checks; `registryHash` is the
            // pristine registry identity (for future diff/update).
            fileHashes[entry.rel] = {
              hash: hashContent(readFileSync(entry.dest, 'utf8')),
              registryHash: entry.file.hash,
            }
          }
        }
        entries[item.name] = {
          package: item.package,
          version: item.version,
          files: fileHashes,
        }
      }

      const recorded = recordCopies(configPath, entries)

      if (recorded === 'manual') {
        out.log(
          `Couldn't record the copies in ${CONFIG_FILENAME} — it isn't valid JSON.`
        )
      } else {
        const created = recorded === 'created' || savedDir === 'created'
        out.log(actionLine(created ? 'Created' : 'Updated', CONFIG_FILENAME))
      }
    }

    const example = items[0]

    if (items.length > 1) {
      out.log(`\nCopied ${items.length} components to ${dir}.`)
    }

    // Registration: shared closing move (note / first-run offer / snippet).
    await concludeRegistration({
      cwd,
      dir,
      configPath,
      oneOff,
      yes,
      firstRun,
      out,
    })

    if (example?.docs) out.log(`\n${example.docs}`)
  },
}
