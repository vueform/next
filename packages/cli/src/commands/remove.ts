import { createHash } from 'node:crypto'
import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
} from 'node:fs'
import path from 'node:path'

import { planUnregister } from '../autoregister.js'
import { writeBarrel } from '../barrel.js'
import {
  CONFIG_FILENAME,
  forgetEntries,
  getConfigValue,
  readComponentsDir,
} from '../config.js'
import { actionLine } from '../output.js'
import { canPrompt, confirm } from '../prompt.js'
import { canSelect, multiSelectFrom } from '../select.js'
import { settleFiles } from '../settle.js'
import type { CloneEntry, Command, CopyEntry } from '../types.js'

function hashContent(content: string) {
  return `sha256:${createHash('sha256').update(content).digest('hex')}`
}

export const remove: Command = {
  name: 'remove',
  usage: 'remove [component...|all]',
  description: 'Remove copied components from your project',
  valueFlags: ['dir'],
  flags: [
    [
      '--dir <path>',
      `Components directory (default: componentsDir from ${CONFIG_FILENAME})`,
    ],
    ['--yes', 'Accept confirmations (registration removal)'],
    ['--force', 'Remove copies even when they were modified'],
  ],
  examples: [
    'vf remove VfText',
    'vf remove VfText VfSelect',
    'vf remove all',
    'vf remove all --force --yes',
    'vf remove',
  ],
  async run({ positionals, flags, out }) {
    if (!positionals.length && !canSelect()) {
      out.fail(
        'Expected one or more component names (or `all`).',
        'Usage: vf remove <component...|all> — see `vf help remove`.'
      )
      return
    }

    const cwd = process.cwd()
    const configPath = path.join(cwd, CONFIG_FILENAME)
    const dir =
      typeof flags.dir === 'string'
        ? flags.dir.replace(/\/+$/, '')
        : readComponentsDir(configPath)

    if (!dir) {
      out.fail(
        'No components directory is configured.',
        'Pass --dir <path>, or run `vf copy` first.'
      )
      return
    }

    const dirAbs = path.resolve(cwd, dir)

    if (!existsSync(dirAbs)) {
      out.fail(`${dir} does not exist — nothing to remove.`)
      return
    }

    const copies = (getConfigValue(configPath, 'copies') ?? {}) as Record<
      string,
      CopyEntry
    >
    const clones = (getConfigValue(configPath, 'clones') ?? {}) as Record<
      string,
      CloneEntry
    >
    const tracked = [...Object.keys(copies), ...Object.keys(clones)]
    const onDisk = readdirSync(dirAbs)
      .filter((file) => /^Vf.+\.vue$/.test(file))
      .map((file) => file.slice(0, -4))
    const known = [...new Set([...tracked, ...onDisk])]

    // Resolve the removal set (case-insensitive against known names).
    const all =
      positionals.length === 1 && ['all', '*'].includes(positionals[0])
    let names: string[]

    if (!positionals.length) {
      // Interactive picker over the copied components (guarded above).
      if (!known.length) {
        out.fail(`No copies found in ${dir}.`)
        return
      }

      const picked = await multiSelectFrom(
        `Copied components in ${dir}:`,
        [...known].sort().map((name) => ({ name }))
      )

      if (picked == null) {
        out.log('Cancelled.')
        return
      }

      names = picked
    } else if (all) {
      names = known
      if (!names.length) {
        out.fail(`No copies found in ${dir}.`)
        return
      }
    } else {
      names = []
      for (const input of positionals) {
        const match =
          known.find((name) => name === input) ??
          known.find((name) => name.toLowerCase() === input.toLowerCase())
        if (!match) {
          out.fail(
            `${input} is not a copied component in ${dir}.`,
            known.length
              ? `Copied components: ${known.join(', ')}.`
              : 'There are no copies here.'
          )
          return
        }
        if (!names.includes(match)) names.push(match)
      }
    }

    // Collect the files per component: provenance is authoritative (it knows
    // sibling files and pristine hashes); untracked copies fall back to the
    // single <Name>.vue on disk.
    const plan = []

    for (const name of names) {
      const entry = copies[name] ?? clones[name]

      if (entry?.files) {
        for (const [rel, recorded] of Object.entries(entry.files)) {
          // Settled baseline; legacy provenance stored the hash as a string.
          const hash =
            typeof recorded === 'string' ? recorded : (recorded?.hash ?? null)
          plan.push({ name, rel, abs: path.resolve(cwd, rel), hash })
        }
      } else {
        const rel = path.join(dir, `${name}.vue`)
        plan.push({ name, rel, abs: path.resolve(cwd, rel), hash: null })
      }
    }

    // Modified / untracked files get ONE batch confirmation.
    const dirty = plan.filter(
      (entry) =>
        existsSync(entry.abs) &&
        (!entry.hash ||
          hashContent(readFileSync(entry.abs, 'utf8')) !== entry.hash)
    )

    if (dirty.length && flags.force !== true) {
      const listed = dirty.slice(0, 5).map((d) => d.rel)
      const more = dirty.length - listed.length
      const description =
        listed.join(', ') + (more > 0 ? ` and ${more} more` : '')

      if (!canPrompt()) {
        out.fail(
          `${dirty.length} file(s) were modified since copying (or aren't tracked): ${description}.`,
          'Pass --force to remove them anyway.'
        )
        return
      }

      const proceed = await confirm(
        `${dirty.length} file(s) were modified since copying (or aren't tracked): ${description}. Remove anyway?`,
        false
      )

      if (!proceed) {
        out.log('Aborted — nothing was removed.')
        return
      }
    }

    // Delete.
    for (const entry of plan) {
      if (existsSync(entry.abs)) {
        rmSync(entry.abs)
        out.log(actionLine('Removed', entry.rel))
      }
    }

    const forgotCopies = forgetEntries(configPath, 'copies', names)
    const forgotClones = forgetEntries(configPath, 'clones', names)

    if (forgotCopies || forgotClones) {
      out.log(actionLine('Updated', CONFIG_FILENAME))
    }

    // Regenerate (or retire) the barrel.
    const barrelFile = writeBarrel(
      dirAbs,
      existsSync(path.join(cwd, 'tsconfig.json'))
    )
    const noneLeft = barrelFile === null

    if (noneLeft) {
      for (const file of ['index.ts', 'index.js']) {
        const barrel = path.join(dirAbs, file)
        if (existsSync(barrel)) {
          rmSync(barrel)
          out.log(actionLine('Removed', path.join(dir, file)))
        }
      }
      try {
        rmdirSync(dirAbs)
        // The single CLI-owned `vueform` directory retires with its last
        // generator output; anything else (src/, components/) is the user's.
        if (path.basename(path.dirname(dirAbs)) === 'vueform') {
          rmdirSync(path.dirname(dirAbs))
        }
      } catch {
        // Not empty — the user keeps other files there.
      }
    } else {
      // Keep the regenerated barrel matching the project's formatting too.
      await settleFiles(cwd, [path.join(dirAbs, barrelFile)])
      out.log(actionLine('Updated', `${dir}/${barrelFile}`))
    }

    // When everything is gone (or `all` was requested), offer to remove the
    // automatic registration from the entry file too.
    if (all || noneLeft) {
      const plan = await planUnregister(cwd, dir)

      if (plan.status === 'possible') {
        let accept = flags.yes === true ? true : null

        if (accept === null && canPrompt()) {
          out.log(
            [
              '',
              `The automatic registration in ${plan.rel} is no longer needed:`,
              '',
              ...plan.preview.map((line) => `  ${line}`),
              '',
            ].join('\n')
          )
          accept = await confirm(`Remove it from ${plan.rel}?`)
        }

        if (accept === true) {
          plan.apply()
          out.log(`Updated ${plan.rel} — registration removed.`)
        } else if (accept === null) {
          out.log(
            `\nNote: ${plan.rel} still registers the removed barrel — remove the import and spread manually, or run \`vf remove all --yes\`.`
          )
        }
      } else if (plan.status === 'impossible' && noneLeft) {
        out.log(
          `\nNote: couldn't remove the registration automatically (${plan.reason}) — clean up the barrel import in your entry file manually.`
        )
      }
    }
  },
}
