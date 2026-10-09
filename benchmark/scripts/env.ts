import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { APP_DIR, ROOT } from './lib'

export interface Environment {
  cpu: string
  ramBytes: number
  os: string
  browser: string
  vue: string
  vueform: string
  /**
   * ISO timestamp of the run (second precision).
   */
  capturedAt: string
}

function osName(): string {
  if (process.platform === 'darwin') {
    const version = execFileSync('sw_vers', ['-productVersion'], {
      encoding: 'utf8',
    }).trim()
    return `macOS ${version}`
  }

  return `${os.type()} ${os.release()}`
}

function packageVersion(pkgJsonPath: string): string {
  return JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')).version
}

/**
 * The machine/version record shown in the docs' environment block.
 */
export function captureEnvironment(browserVersion: string): Environment {
  return {
    capturedAt: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    cpu: os.cpus()[0]?.model ?? 'unknown',
    ramBytes: os.totalmem(),
    os: osName(),
    browser: `Chromium ${browserVersion}`,
    vue: packageVersion(
      path.join(APP_DIR, 'node_modules', 'vue', 'package.json')
    ),
    vueform: packageVersion(path.join(ROOT, 'packages', 'ui', 'package.json')),
  }
}
