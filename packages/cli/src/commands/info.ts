import { existsSync } from 'node:fs'
import path from 'node:path'

import { CONFIG_FILENAME, readComponentsDir } from '../config.js'
import { version } from '../index.js'
import {
  VUEFORM_PACKAGES,
  detectAdapter,
  detectPackageManager,
  detectProjectType,
  packageVersion,
} from '../project.js'
import type { Command } from '../types.js'

export const info: Command = {
  name: 'info',
  usage: 'info',
  description: 'Print environment, project, and Vueform package details',
  flags: [['--json', 'Output as JSON']],
  examples: ['vf info', 'vf info --json'],
  async run({ flags, out }) {
    const cwd = process.cwd()
    const configPath = path.join(cwd, CONFIG_FILENAME)
    const configExists = existsSync(configPath)

    const packages: Record<string, string> = {}

    for (const name of VUEFORM_PACKAGES) {
      const found = packageVersion(name, cwd)
      if (found) packages[name] = found
    }

    // Isolated installs (pnpm) don't hoist the CLI into the project's
    // node_modules when it arrives as an adapter dependency — the running
    // package knows its own version regardless.
    packages['@vueform/cli'] ??= version()

    const data = {
      node: process.version,
      packageManager: detectPackageManager(cwd),
      cwd,
      project: {
        type: detectProjectType(cwd),
        adapter: detectAdapter(cwd),
      },
      packages,
      config: {
        path: CONFIG_FILENAME,
        exists: configExists,
        componentsDir: configExists ? readComponentsDir(configPath) : null,
      },
    }

    if (flags.json === true) {
      console.log(JSON.stringify(data, null, 2))
      return
    }

    const lines = [
      `node: ${data.node}`,
      `package manager: ${data.packageManager ?? 'unknown'}`,
      `cwd: ${cwd}`,
      `project type: ${data.project.type ?? 'unknown'}`,
      `adapter: ${data.project.adapter ?? 'none detected'}`,
    ]

    for (const [name, version] of Object.entries(packages)) {
      lines.push(`${name}: ${version}`)
    }

    lines.push(
      data.config.exists
        ? `config: ${CONFIG_FILENAME} (componentsDir: ${data.config.componentsDir ?? 'not set'})`
        : `config: none (${CONFIG_FILENAME} not found)`
    )

    out.log(lines.join('\n'))
  },
}
