import { existsSync } from 'node:fs'
import path from 'node:path'

import { CONFIG_FILENAME, readComponentsDir } from '../config.mjs'
import {
  VUEFORM_PACKAGES,
  detectAdapter,
  detectPackageManager,
  detectProjectType,
  packageVersion,
} from '../project.mjs'

export const info = {
  name: 'info',
  usage: 'info',
  description: 'Print environment, project, and Vueform package details',
  flags: [['--json', 'Output as JSON']],
  examples: ['vueform info', 'vueform info --json'],
  async run({ flags, out }) {
    const cwd = process.cwd()
    const configPath = path.join(cwd, CONFIG_FILENAME)
    const configExists = existsSync(configPath)

    const packages = {}

    for (const name of VUEFORM_PACKAGES) {
      const version = packageVersion(name, cwd)
      if (version) packages[name] = version
    }

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
