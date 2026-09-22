/**
 * Black-box functional tests: every test executes the BUILT bin
 * (dist/bin/vueform.js) in a throwaway project — exactly what a user runs.
 */
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { cleanup, runCli, scaffoldProject } from './helpers.js'

let tmp: string

afterEach(() => {
  if (tmp) cleanup(tmp)
})

describe('vueform --version / --help', () => {
  it('prints the package version', () => {
    tmp = scaffoldProject()
    const { stdout, status } = runCli(tmp, ['--version'])
    expect(status).toBe(0)
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/)
  })

  it('prints usage with the command catalog', () => {
    tmp = scaffoldProject()
    const { stdout } = runCli(tmp, ['--help'])
    expect(stdout).toContain('Usage: vueform <command>')
    for (const cmd of ['copy', 'clone', 'remove', 'view', 'list', 'info']) {
      expect(stdout).toContain(cmd)
    }
  })
})

describe('vueform list', () => {
  it('lists the adapter registry components', () => {
    tmp = scaffoldProject()
    const { stdout, status } = runCli(tmp, ['list'])
    expect(status).toBe(0)
    expect(stdout).toContain('VfText')
    expect(stdout).toContain('@vueform/ui')
  })

  it('fails with guidance outside a Vueform project', () => {
    tmp = mkdtempSync(path.join(tmpdir(), 'vueform-cli-empty-'))
    writeFileSync(path.join(tmp, 'package.json'), '{"name":"x","private":true}')
    const { stdout, status } = runCli(tmp, ['list'])
    expect(status).toBe(1)
    expect(stdout).toContain('No Vueform package found')
  })
})

describe('vueform copy', () => {
  it('copies a component, generates the barrel, and is idempotent', () => {
    tmp = scaffoldProject()

    const first = runCli(tmp, ['copy', 'VfText', '--dir', 'src/vueform'])
    expect(first.status).toBe(0)

    const component = path.join(tmp, 'src/vueform/VfText.vue')
    const barrel = path.join(tmp, 'src/vueform/index.ts')
    expect(existsSync(component)).toBe(true)
    expect(existsSync(barrel)).toBe(true)

    const barrelSource = readFileSync(barrel, 'utf8')
    expect(barrelSource).toContain("import VfText from './VfText.vue'")
    expect(barrelSource).toContain('export const components')

    // Re-running against unchanged files must be a no-op, not a conflict.
    const second = runCli(tmp, ['copy', 'VfText', '--dir', 'src/vueform'])
    expect(second.status).toBe(0)
    expect(second.stdout).toContain('Up to date')
  })

  it('records provenance in vueform.config.json with --yes', () => {
    tmp = scaffoldProject()

    const { status } = runCli(tmp, ['copy', 'VfText', '--yes'])
    expect(status).toBe(0)

    const configPath = path.join(tmp, 'vueform.config.json')
    expect(existsSync(configPath)).toBe(true)

    const config = JSON.parse(readFileSync(configPath, 'utf8'))
    expect(config.componentsDir).toBeTruthy()
    expect(config.copies.VfText.package).toBe('@vueform/ui')
    expect(Object.keys(config.copies.VfText.files).length).toBeGreaterThan(0)
    for (const entry of Object.values(config.copies.VfText.files)) {
      expect((entry as { hash: string }).hash).toMatch(/^sha256:/)
    }
  })

  it('works in a plain-JS project: js barrel, no typescript required', () => {
    tmp = scaffoldProject({ typescript: false })

    const { stdout, status } = runCli(tmp, [
      'copy',
      'VfText',
      '--dir',
      'src/vueform',
    ])
    expect(status).toBe(0)

    // No tsconfig → the CLI-owned barrel is emitted as JS.
    expect(existsSync(path.join(tmp, 'src/vueform/index.js'))).toBe(true)
    expect(existsSync(path.join(tmp, 'src/vueform/index.ts'))).toBe(false)

    // Auto-registration degrades to the printed manual snippet.
    expect(stdout).toContain('Register the generated barrel')
  })

  it('rejects unknown components with suggestions', () => {
    tmp = scaffoldProject()
    const { stdout, status } = runCli(tmp, ['copy', 'VfTx', '--dir', 'x'])
    expect(status).toBe(1)
    expect(stdout).toContain('not in')
    expect(stdout).toContain('VfText')
  })
})

describe('vueform clone', () => {
  it('creates a renamed element from a blueprint template', () => {
    tmp = scaffoldProject()

    const { status, stdout } = runCli(tmp, [
      'clone',
      'VfText',
      'password',
      '--dir',
      'src/vueform',
    ])
    expect(status).toBe(0)
    expect(stdout).toContain('VfPassword')

    const clone = path.join(tmp, 'src/vueform/VfPassword.vue')
    expect(existsSync(clone)).toBe(true)

    const source = readFileSync(clone, 'utf8')
    expect(source).toContain('VfPassword')
    expect(source).toContain("'password'")
    expect(source).not.toContain('VfCloneName')
    expect(source).not.toContain('__TYPE__')
  })

  it('refuses to overwrite an existing clone', () => {
    tmp = scaffoldProject()
    runCli(tmp, ['clone', 'VfText', 'password', '--dir', 'src/vueform'])
    const again = runCli(tmp, [
      'clone',
      'VfText',
      'password',
      '--dir',
      'src/vueform',
    ])
    expect(again.status).toBe(1)
    expect(again.stdout).toContain('already exists')
  })
})

describe('vueform view', () => {
  it('shows a component manifest', () => {
    tmp = scaffoldProject()
    const { stdout, status } = runCli(tmp, ['view', 'VfText'])
    expect(status).toBe(0)
    expect(stdout).toContain('VfText')
  })
})
