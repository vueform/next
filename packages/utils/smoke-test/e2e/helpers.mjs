/**
 * Shared spec plumbing: the console policy and the env metadata the harness
 * wrote at assemble time. Plain ESM on purpose — runs live under node_modules,
 * where Node refuses to type-strip TypeScript.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect } from '@playwright/test'

/**
 * The env metadata (adapter, env, framework, rendering, mode, pm, port).
 */
export function runInfo() {
  const dir = path.dirname(fileURLToPath(import.meta.url))
  return JSON.parse(
    fs.readFileSync(path.join(dir, '..', 'smoke', 'run.json'), 'utf8')
  )
}

/**
 * Messages that are tolerated. Empty by default — every entry needs a reason.
 */
const ALLOWLIST = []

/**
 * Fails the test on any console error, uncaught page error, or Vue warning
 * (hydration mismatches surface as warnings in dev and as a console error in
 * prod, so both are covered).
 *
 * @param {import('@playwright/test').Page} page
 */
export function watchConsole(page) {
  const problems = []

  const record = (entry) => {
    if (!ALLOWLIST.some((re) => re.test(entry))) problems.push(entry)
  }

  page.on('console', (msg) => {
    const type = msg.type()
    const text = msg.text()
    if (
      type === 'error' ||
      (type === 'warning' && /\[Vue warn\]|hydrat/i.test(text))
    ) {
      record(`console.${type}: ${text}`)
    }
  })
  page.on('pageerror', (error) => record(`pageerror: ${error.message}`))

  return {
    assertClean() {
      expect(problems, 'console must stay clean').toEqual([])
    },
  }
}
