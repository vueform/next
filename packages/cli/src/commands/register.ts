import { existsSync } from 'node:fs'
import path from 'node:path'

import { planAutoRegister, registrationSnippet } from '../autoregister.js'
import { CONFIG_FILENAME, readComponentsDir } from '../config.js'
import { detectProjectType } from '../project.js'
import type { Command } from '../types.js'

export const register: Command = {
  name: 'register',
  usage: 'register',
  description: 'Register the copied components barrel in your entry file',
  valueFlags: ['dir'],
  flags: [
    [
      '--dir <path>',
      `Barrel directory (default: componentsDir from ${CONFIG_FILENAME})`,
    ],
  ],
  examples: ['vf register', 'vf register --dir src/vueform/components'],
  async run({ flags, out }) {
    const cwd = process.cwd()
    const dir =
      typeof flags.dir === 'string'
        ? flags.dir.replace(/\/+$/, '')
        : readComponentsDir(path.join(cwd, CONFIG_FILENAME))

    if (!dir) {
      out.fail(
        'No components directory is configured.',
        'Run `vf copy <component>` first, or pass --dir <path>.'
      )
      return
    }

    const barrel = ['index.ts', 'index.js'].some((file) =>
      existsSync(path.join(cwd, dir, file))
    )

    if (!barrel) {
      out.fail(
        `No copies found in ${dir} (missing barrel).`,
        'Run `vf copy <component>` first.'
      )
      return
    }

    if (detectProjectType(cwd) === 'nuxt') {
      out.fail(
        'Automatic registration is not supported in Nuxt projects yet.',
        `Register the barrel (${dir}) through the components map of your Vueform configuration.`
      )
      return
    }

    const plan = await planAutoRegister(cwd, dir)

    if (plan.status === 'registered') {
      out.log(`Already registered — ${plan.rel} imports the barrel.`)
      return
    }

    if (plan.status === 'impossible') {
      out.fail(
        `Automatic registration isn't possible: ${plan.reason}.`,
        registrationSnippet(cwd, dir)
      )
      return
    }

    plan.apply()
    out.log(
      [
        `Updated ${plan.rel}:`,
        ...plan.preview.map((line: string) => `  ${line}`),
      ].join('\n')
    )
  },
}
