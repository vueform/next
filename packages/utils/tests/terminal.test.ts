import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { createRunLog } from '../src/terminal/logs'
import { resolveTerminalMode, stripDisplayFlags } from '../src/terminal/mode'
import { stripAnsi, termLink } from '../src/terminal/paint'
import {
  countFormatIssues,
  countLintIssues,
  countTsErrors,
  isCached,
  issuesDetail,
} from '../src/terminal/parsers'
import { createRows } from '../src/terminal/rows'

describe('mode', () => {
  const tty = { isTTY: true } as NodeJS.WriteStream
  const pipe = { isTTY: undefined } as unknown as NodeJS.WriteStream

  it('is live on a TTY without flags', () => {
    expect(resolveTerminalMode({ argv: [], stream: tty, env: {} })).toEqual({
      live: true,
      verbose: false,
      ci: false,
      colors: true,
    })
  })

  it('is plain when piped', () => {
    expect(resolveTerminalMode({ argv: [], stream: pipe, env: {} }).live).toBe(
      false
    )
  })

  it('--ci and --verbose force plain mode on a TTY', () => {
    const ci = resolveTerminalMode({ argv: ['--ci'], stream: tty, env: {} })
    expect(ci).toMatchObject({ live: false, ci: true, colors: false })
    const verbose = resolveTerminalMode({
      argv: ['--verbose'],
      stream: tty,
      env: {},
    })
    expect(verbose).toMatchObject({ live: false, verbose: true })
  })

  it('honors NO_COLOR and the explicit live override', () => {
    expect(
      resolveTerminalMode({ argv: [], stream: tty, env: { NO_COLOR: '1' } })
        .colors
    ).toBe(false)
    expect(
      resolveTerminalMode({ argv: [], stream: pipe, env: {}, live: true }).live
    ).toBe(true)
  })

  it('strips only the display flags', () => {
    expect(stripDisplayFlags(['a', '--ci', 'b', '--verbose'])).toEqual([
      'a',
      'b',
    ])
  })
})

describe('paint', () => {
  it('stripAnsi removes color codes', () => {
    expect(stripAnsi('\x1b[32m✓ ok\x1b[0m plain')).toBe('✓ ok plain')
  })

  it('termLink wraps only in live mode', () => {
    expect(termLink('/tmp/x.log', { live: false })).toBe('/tmp/x.log')
    expect(termLink('/tmp/x.log', { live: true })).toContain(
      '\x1b]8;;file:///tmp/x.log'
    )
  })
})

describe('parsers', () => {
  it('counts oxlint and stylish issues', () => {
    expect(
      countLintIssues(
        'Found 2 warnings and 1 error.\n✖ 3 problems (1 error, 2 warnings)'
      )
    ).toBe(6)
    expect(countLintIssues('all clean')).toBe(0)
  })

  it('counts format issues', () => {
    expect(
      countFormatIssues(
        ['src/a.ts (3ms)', '[warn] src/b.ts', '[error] parse error', 'ok'].join(
          '\n'
        )
      )
    ).toBe(3)
  })

  it('counts ts errors', () => {
    expect(
      countTsErrors("a.ts(1,1): error TS2304: Cannot find name 'x'.")
    ).toBe(1)
  })

  it('issuesDetail renders a count or nothing', () => {
    expect(issuesDetail(0)).toEqual({})
    expect(issuesDetail(1)).toEqual({ detail: '1 issue', issues: 1 })
    expect(issuesDetail(2)).toEqual({ detail: '2 issues', issues: 2 })
  })

  it('detects only full cache hits', () => {
    expect(isCached('vp run: cache hit, replayed')).toBe(true)
    expect(isCached('vp run: 3/3 cache hit (100%)')).toBe(true)
    expect(isCached('vp run: 2/3 cache hit (66%)')).toBe(false)
    expect(isCached('◉ cache hit, replaying')).toBe(false)
  })
})

describe('createRunLog', () => {
  let dir: string
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }))

  it('prunes old sessions by mtime, keeping the newest', () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vf-logs-'))
    const old = Date.now() - 1000 * 60 * 60
    for (let i = 0; i < 25; i++) {
      const file = path.join(dir, `2026010${i % 10}-00000${i}.log`)
      fs.writeFileSync(file, 'x')
      fs.utimesSync(file, new Date(old + i * 1000), new Date(old + i * 1000))
    }
    const log = createRunLog({ dir })
    log.close()
    const kept = fs.readdirSync(dir).filter((f) => f.endsWith('.log'))
    // 19 old sessions survive next to the new one (KEPT_LOGS = 20).
    expect(kept).toHaveLength(20)
    expect(kept).not.toContain('20260100-000000.log')
    expect(kept).toContain(path.basename(log.file))
  })

  it('prunes whole sessions including siblings, never other prefixes', () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vf-logs-'))
    const old = Date.now() - 1000 * 60 * 60
    for (let i = 0; i < 25; i++) {
      const base = path.join(dir, `a-2026-${String(i).padStart(3, '0')}`)
      fs.writeFileSync(`${base}.log`, 'x')
      fs.writeFileSync(`${base}.errors.log`, 'x')
      fs.utimesSync(
        `${base}.log`,
        new Date(old + i * 1000),
        new Date(old + i * 1000)
      )
    }
    // A fresh session under another prefix must survive even though its name
    // sorts first.
    const fresh = path.join(dir, 'b-2026-000.log')
    fs.writeFileSync(fresh, 'x')
    const log = createRunLog({ dir, prefix: 'a' })
    log.close()
    const kept = fs.readdirSync(dir)
    expect(kept).toContain('b-2026-000.log')
    expect(kept).not.toContain('a-2026-000.log')
    expect(kept).not.toContain('a-2026-000.errors.log')
  })

  it('writes distilled ANSI-stripped sections, or nothing', () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vf-logs-'))
    const log = createRunLog({ dir })
    expect(log.writeErrors([])).toBeNull()
    expect(fs.existsSync(log.errorsFile)).toBe(false)
    const written = log.writeErrors([
      { name: 'core', body: '\x1b[31mboom\x1b[0m\n' },
    ])
    expect(written).toBe(log.errorsFile)
    expect(fs.readFileSync(log.errorsFile, 'utf8')).toBe(
      '––––– core –––––\n\nboom\n'
    )
    log.close()
  })

  it('skips the session log in errors-only mode', () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vf-logs-'))
    const log = createRunLog({ dir, mainLog: false })
    log.write('ignored')
    log.section('ignored')
    log.close()
    expect(fs.existsSync(log.file)).toBe(false)
  })
})

describe('createRows rendering', () => {
  const mode = { live: false, verbose: true, ci: false, colors: false }

  const make = () =>
    createRows({
      title: 'Test',
      rows: [
        { id: 'core' },
        { id: 'ui' },
        { id: 'later', detail: 'waiting' },
        { id: 'gone', status: 'skip', detail: 'no dist' },
      ],
      mode,
      plain: 'none',
    })

  it('renders the full row-state vocabulary', () => {
    const rows = make()
    // Width: longest label (5) + 2.
    expect(rows.rowLine('core')).toBe('  · core   ')
    expect(rows.rowLine('later')).toBe('  · later  waiting')
    expect(rows.rowLine('gone')).toBe('  – gone   no dist')

    // The completion-line spinner is empty, like the originals' `spin: ''`.
    rows.start('core')
    expect(rows.rowLine('core')).toMatch(/^ {3}core {3}0\.\ds$/)
    rows.progress('core', '3/9')
    expect(rows.rowLine('core')).toMatch(/^ {3}core {3}3\/9 · 0\.\ds$/)

    rows.pass('core', '9 tests passed', { warns: 2 })
    expect(rows.rowLine('core')).toMatch(
      /^ {2}✓ core {3}9 tests passed · 2 warns · 0\.\ds$/
    )

    rows.start('ui')
    rows.fail('ui', 'exited with 1')
    expect(rows.rowLine('ui')).toMatch(/^ {2}✗ ui {5}exited with 1 · 0\.\ds$/)
    rows.finish()
  })

  it('keeps the cache mark and elapsed-as-detail fallback', () => {
    const rows = make()
    rows.start('core')
    rows.pass('core', '', { cached: true })
    // No detail: the elapsed time is the green detail, no ` · time` suffix.
    expect(rows.rowLine('core')).toMatch(
      /^ {2}✓ core {3}0\.\ds \(from cache\)$/
    )
    rows.markCached('ui')
    rows.pass('ui', 'built')
    // pass() resets the mark; markCached after completion keeps it.
    expect(rows.rowLine('ui')).toBe('  ✓ ui     built')
    rows.markCached('ui')
    expect(rows.rowLine('ui')).toBe('  ✓ ui     built (from cache)')
    rows.finish()
  })

  it('is idempotent across double completion', () => {
    const rows = make()
    rows.start('core')
    rows.pass('core', 'first')
    rows.pass('core', 'second')
    expect(rows.rowLine('core')).toContain('first')
    rows.finish()
    rows.finish()
  })
})
