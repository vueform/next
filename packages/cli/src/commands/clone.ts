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
  recordClone,
  saveComponentsDir,
} from '../config.js'
import { actionLine } from '../output.js'
import { ask, canPrompt } from '../prompt.js'
import { concludeRegistration } from '../registration.js'
import { loadItem, loadRegistry, suggestItems } from '../registry.js'
import { canSelect, selectFrom } from '../select.js'
import { runPostCopy, settleFiles } from '../settle.js'
import type { Command } from '../types.js'

function hashContent(content: string) {
  return `sha256:${createHash('sha256').update(content).digest('hex')}`
}

const TYPE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

function nameFor(type: string) {
  return `Vf${type
    .split('-')
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join('')}`
}

export const clone: Command = {
  name: 'clone',
  usage: 'clone [element] [type]',
  description: "Create a new element from an existing element's blueprint",
  valueFlags: ['dir'],
  flags: [
    ['--dir <path>', 'Target directory for this run (skips prompts + config)'],
    ['--yes', 'Accept the recommended directory, no prompts'],
  ],
  examples: [
    'vueform clone',
    'vueform clone VfText',
    'vueform clone VfText password',
  ],
  async run({ positionals, flags, out }) {
    const [element, type, ...extra] = positionals

    if (extra.length) {
      out.fail(
        'Expected at most an element name and a type.',
        'Usage: vueform clone [element] [type] — see `vueform help clone`.'
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

    const elements = registry.index.items.filter((item) => item.element)

    if (!elements.length) {
      out.fail(
        `${registry.package} ships no clonable elements.`,
        'Update the package to a version that ships clone templates.'
      )
      return
    }

    // Resolve the base element: argument or interactive picker.
    let base = null

    if (element) {
      const item = loadItem(registry, element)

      if (!item) {
        const suggestions = suggestItems(registry, element)
        out.fail(
          `${element} is not in ${registry.package}'s registry.`,
          suggestions.length
            ? `Did you mean: ${suggestions.join(', ')}? See \`vueform list\`.`
            : 'See `vueform list` for available components.'
        )
        return
      }

      if (!item.element || !item.clone) {
        out.fail(
          `${item.name} is not a clonable element.`,
          `Clonable elements: ${elements.map((entry) => entry.name).join(', ')}.`
        )
        return
      }

      base = item
    } else {
      if (!canSelect()) {
        out.fail(
          'No element given and this is not an interactive terminal.',
          'Usage: vueform clone <element> <type> — see `vueform help clone`.'
        )
        return
      }

      const picked = await selectFrom(
        `Elements in ${registry.package} (the clone's base):`,
        elements.map((item) => ({ name: item.name, hint: item.description }))
      )

      if (!picked) {
        out.log('Cancelled.')
        return
      }

      base = loadItem(registry, picked)
    }

    if (!base?.clone) {
      out.fail(
        `${registry.package}'s registry has no clone template for ${base?.name}.`
      )
      return
    }

    // Resolve the new element's type → the component name Vf<PascalCase>.
    let newType = typeof type === 'string' ? type : null

    if (newType && !TYPE_PATTERN.test(newType)) {
      out.fail(
        `${newType} is not a valid element type.`,
        "Use lowercase kebab-case, e.g. 'password' or 'my-input'."
      )
      return
    }

    if (!newType) {
      if (!canPrompt()) {
        out.fail(
          'No type given and this is not an interactive terminal.',
          'Usage: vueform clone <element> <type> — see `vueform help clone`.'
        )
        return
      }

      while (!newType) {
        const answer = await ask(
          `Type of the new element (e.g. 'password' — becomes <name>: 'type' in your schemas)`
        )
        if (!answer) continue
        if (!TYPE_PATTERN.test(answer)) {
          out.log("Use lowercase kebab-case, e.g. 'password' or 'my-input'.")
          continue
        }
        newType = answer
      }
    }

    const name = nameFor(newType)

    if (registry.index.items.some((item) => item.name === name)) {
      out.fail(
        `${name} already exists in ${registry.package}.`,
        'Pick another type, or use `vueform copy` to customize the built-in component.'
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

      saveDir = true
    }

    const rel = path.join(dir, `${name}.vue`)
    const dest = path.resolve(cwd, rel)

    // A clone is the user's own element from the moment it exists — never
    // overwrite one.
    if (existsSync(dest)) {
      out.fail(
        `${rel} already exists.`,
        'Clones are your own code — remove it first if you really want to start over.'
      )
      return
    }

    const templatePath = path.join(registry.dir, 'clones', base.clone.path)

    if (!existsSync(templatePath)) {
      out.fail(`${registry.package}'s registry is missing ${base.clone.path}.`)
      return
    }

    const content = readFileSync(templatePath, 'utf8')
      .replaceAll('VfCloneName', name)
      .replaceAll('__TYPE__', newType)

    mkdirSync(path.dirname(dest), { recursive: true })
    writeFileSync(dest, content)
    out.log(actionLine('Created', rel))

    // Barrel — the clone registers through it like any copy.
    const barrelFile = writeBarrel(
      path.resolve(cwd, dir),
      existsSync(path.join(cwd, 'tsconfig.json'))
    )

    if (barrelFile) out.log(actionLine('Updated', `${dir}/${barrelFile}`))

    // Settle with the project's own tooling (postCopy or safe prettier pass),
    // then record the baseline hash of what actually landed.
    const written = [rel]
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
        written.map((file) => path.resolve(cwd, file))
      )

      if (settled) {
        out.log(
          `Formatted   ${settled} file(s) with the project prettier config`
        )
      }
    }

    // Auto-registration is only ever offered on the very first run — detected
    // before this clone is recorded.
    const firstRun =
      !getConfigValue(configPath, 'copies') &&
      !getConfigValue(configPath, 'clones') &&
      getConfigValue(configPath, 'autoRegister') === null

    if (!oneOff) {
      const savedDir = saveDir ? saveComponentsDir(configPath, dir) : null
      const recorded = recordClone(configPath, name, {
        base: base.name,
        type: newType,
        package: base.package,
        version: base.version,
        files: { [rel]: { hash: hashContent(readFileSync(dest, 'utf8')) } },
      })

      if (recorded === 'manual') {
        out.log(
          `Couldn't record the clone in ${CONFIG_FILENAME} — it isn't valid JSON.`
        )
      } else {
        const created = recorded === 'created' || savedDir === 'created'
        out.log(actionLine(created ? 'Created' : 'Updated', CONFIG_FILENAME))
      }
    }

    out.log(
      `\n${name} is a new element of type '${newType}', built on ${base.name}'s blueprint — use it in schemas as { type: '${newType}' }.`
    )

    await concludeRegistration({
      cwd,
      dir,
      configPath,
      oneOff,
      yes,
      firstRun,
      out,
    })

    if (base.clone.docs) out.log(`\n${base.clone.docs}`)
  },
}
