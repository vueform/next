import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const perfDir = resolve(here, '..')
const coreDir = resolve(perfDir, '../..')
export const resultsDir = resolve(perfDir, '.results')
export const historyPath = resolve(resultsDir, 'history.json')
export const reportPath = resolve(resultsDir, 'RESULTS.md')

/**
 * Catalog of every recorded bench. `id` is the history.json key.
 */
const BENCHES = {
  'registry > derived views: repeated reads': {
    label: 'list reads',
    desc: 'Re-read `statefulChildren$`, `availableStatefulChildren$`, and `hoistedChildren$` 50 times on a 500-child `useChildren` registry (no form, no DOM). Measures whether those lists are cached or rebuilt on every access.',
  },
  'registry > derived views: invalidate + read': {
    label: 'list invalidate',
    desc: 'Flip one child’s `available`, then read the three lists. Guards that caching does not make the write/invalidate path slower.',
  },
  'registry > registration churn': {
    label: 'register/unregister',
    desc: 'Register then unregister 500 paths on an empty registry. Baseline for the identity-guarded set/delete used by `elements$`.',
  },
  'form-registry > mount+unmount n=100': {
    label: 'mount 100',
    desc: 'Mount and immediately unmount a 100-field form (grouped texts, some conditional, some static). Full child registration + unregistration, including the form’s `elements$` descendant index.',
  },
  'form-registry > mount+unmount n=300': {
    label: 'mount 300',
    desc: 'Mount and immediately unmount a 300-field form (grouped texts, some conditional, some static). Full child registration + unregistration, including the form’s `elements$` descendant index.',
  },
  'form-registry > payload reads n=300': {
    label: 'cached payload',
    desc: 'Read `payload` / `invalid` / `empty` / `dirty` / `completed` / `errors` on an already-mounted 300-field form with no model change. These are Vue computeds, so this is the already-cached path — a guard that it stays cheap, not a test of list rebuilds.',
  },
  'form-registry > condition toggle + payload n=300': {
    label: 'condition toggle',
    desc: 'Flip a trigger field that hides/shows ~1/3 of a 300-field form, then re-read the aggregates. End-to-end invalidation of availability + payload.',
  },
  'form-registry > list row add/remove': {
    label: 'list add/remove',
    desc: 'Add then remove one row on an 80-row `VfList`. Registration churn with path re-keying (the identity-guard case).',
  },
  'validation-list > container validate (rows filled) rows=200': {
    label: 'container validate',
    desc: 'Validate a 200-row `VfList` whose rows are pre-filled and completed, so only the list’s own rules (`min`/`max`) run. Isolates the container-rule cost plus the staleness bookkeeping around it.',
  },
  'validation-list > full validate (rows empty) rows=200': {
    label: 'full validate',
    desc: 'Validate the same list with all 200 rows empty: every row’s `required` rule runs plus the container rules. Guards the synchronous fast path (no per-unit await for sync rules).',
  },
  'validation-list > keystroke w/ container rules rows=200': {
    label: 'ruled keystroke',
    desc: 'Update one row’s text with `validateOn: change` on a list that has container rules: the write marks row + container stale, both re-validate, and `validated` re-aggregates. Worst case for store-driven staleness marking.',
  },
  'validation-list > keystroke w/o container rules rows=200': {
    label: 'plain keystroke',
    desc: 'Same keystroke on a list without container rules — leaf-only validation, the contrast baseline for the ruled keystroke.',
  },
  'idle n=300': {
    label: 'idle 300',
    desc: 'Retained heap of a mounted 300-field form that is not being read. Every element owns a `useChildren`; this is the per-element registry overhead at rest (`toRef` vs lazy `computed`).',
  },
  'idle n=1000': {
    label: 'idle 1000',
    desc: 'Same as idle 300, with 1000 fields — checks that overhead scales linearly, not worse.',
  },
  'hot reads n=300': {
    label: 'after reads 300',
    desc: 'Retained heap after reading the form aggregates once, so hot derived views have instantiated and cached. Extra vs idle is the cost of those cached lists + dependency links.',
  },
  'after unmount n=300': {
    label: 'after unmount',
    desc: 'Heap delta after mount + unmount + GC vs the pre-mount baseline. Should stay ~0; a rise means the registry or dep links leaked.',
  },
}

/**
 * Report sections. Each area is a `##` heading (like types-perf's
 * `define-schema-500`). Add a new area when a new class of benches lands.
 */
const AREAS = [
  {
    title: 'Child registry',
    blurb: [
      'How expensive it is to track child element instances (`useChildren`) and',
      'the form’s full-path descendant index (`elements$`).',
    ].join(' '),
    summary: [
      {
        key: 'time',
        name: 'registry > derived views: repeated reads',
        label: 'list reads',
        kind: 'time',
      },
      {
        key: 'time',
        name: 'form-registry > mount+unmount n=300',
        label: 'mount 300',
        kind: 'time',
      },
      {
        key: 'memory',
        name: 'idle n=300',
        label: 'heap 300',
        kind: 'mem',
      },
      {
        key: 'memory',
        name: 'idle n=1000',
        label: 'heap 1000',
        kind: 'mem',
      },
    ],
    tables: [
      {
        title: 'Derived lists (no form)',
        blurb:
          'Standalone `useChildren()` with 500 fake children. No VfForm, no DOM.',
        source: 'time',
        prefix: 'registry > ',
        order: [
          'registry > derived views: repeated reads',
          'registry > derived views: invalidate + read',
          'registry > registration churn',
        ],
      },
      {
        title: 'Mounted form',
        blurb:
          'Real `VfForm`: grouped text fields, `children$` (direct) vs `elements$` (every descendant).',
        source: 'time',
        prefix: 'form-registry > ',
        order: [
          'form-registry > mount+unmount n=100',
          'form-registry > mount+unmount n=300',
          'form-registry > payload reads n=300',
          'form-registry > condition toggle + payload n=300',
          'form-registry > list row add/remove',
        ],
      },
      {
        title: 'Retained heap',
        blurb:
          'What stays alive after GC. “after unmount” should stay ~0; a large % there is usually noise around zero.',
        source: 'memory',
        prefix: '',
        order: [
          'idle n=300',
          'idle n=1000',
          'hot reads n=300',
          'after unmount n=300',
        ],
      },
    ],
  },
  {
    title: 'Validation staleness',
    blurb: [
      'The large-list worst case for store-driven validation staleness:',
      'container-level rules run against the full list value, and every write',
      'marks affected results stale through the model store.',
    ].join(' '),
    summary: [
      {
        key: 'time',
        name: 'validation-list > full validate (rows empty) rows=200',
        label: 'full validate',
        kind: 'time',
      },
      {
        key: 'time',
        name: 'validation-list > keystroke w/ container rules rows=200',
        label: 'ruled keystroke',
        kind: 'time',
      },
    ],
    tables: [
      {
        title: 'Large list (200 rows)',
        blurb:
          'A 200-row `VfList` with `min`/`max` container rules and `required` rows, `validateOn: change`.',
        source: 'time',
        prefix: 'validation-list > ',
        order: [
          'validation-list > container validate (rows filled) rows=200',
          'validation-list > full validate (rows empty) rows=200',
          'validation-list > keystroke w/ container rules rows=200',
          'validation-list > keystroke w/o container rules rows=200',
        ],
      },
    ],
  },
]

/**
 * Short SHA of HEAD.
 */
export function gitHead() {
  const sha = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: coreDir,
    encoding: 'utf8',
  })
  if (sha.status !== 0) return undefined
  return sha.stdout.trim() || undefined
}

/**
 * Reads `results/history.json` (`commit → { timestamp, time, memory }`).
 */
export function readHistory() {
  if (!existsSync(historyPath)) return {}
  try {
    return JSON.parse(readFileSync(historyPath, 'utf8'))
  } catch {
    return {}
  }
}

/**
 * Writes history.json.
 *
 * @param history Commit-keyed results.
 */
export function writeHistory(history) {
  mkdirSync(resultsDir, { recursive: true })
  writeFileSync(historyPath, `${JSON.stringify(history, null, 2)}\n`)
}

/**
 * Upserts this commit's run. Re-running the same id overwrites and moves it to
 * the end (most recent), matching types-perf.
 *
 * @param history Existing history.
 * @param commit Commit id.
 * @param current Flattened time + memory maps.
 */
export function upsertHistory(history, commit, current) {
  const next = {}
  for (const [id, entry] of Object.entries(history)) {
    if (id !== commit) next[id] = entry
  }
  next[commit] = {
    timestamp: new Date().toISOString(),
    time: current.time,
    memory: current.memory,
    ...(history[commit]?.base ? { base: true } : {}),
  }
  return next
}

/**
 * Marks a history entry as the base — the given commit, or the most recent
 * entry when omitted. Newer runs are then graded against it in RESULTS.md
 * instead of against their previous row.
 *
 * @param history Existing history.
 * @param commit Commit id to promote; defaults to the newest entry.
 */
export function rebaseHistory(history, commit) {
  const ids = Object.keys(history)
  if (!ids.length) return history
  const target = commit ?? ids[ids.length - 1]
  if (!history[target]) {
    throw new Error(
      `Unknown commit "${target}". Recorded commits: ${ids.join(', ')}`
    )
  }
  const next = {}
  for (const [id, entry] of Object.entries(history)) {
    const { base, ...rest } = entry
    next[id] = id === target ? { ...rest, base: true } : rest
  }
  return next
}

/**
 * Previous snapshot to diff against: same commit if it already exists (re-run),
 * otherwise the most recent other commit.
 *
 * @param history Existing history.
 * @param commit Commit id about to be written.
 */
export function comparisonTarget(history, commit) {
  if (history[commit]) {
    return { kind: 'same-commit', commit, entry: history[commit] }
  }
  const ids = Object.keys(history)
  if (!ids.length) return undefined
  const id = ids[ids.length - 1]
  return { kind: 'previous-commit', commit: id, entry: history[id] }
}

function metric(entry, source, name) {
  return entry?.[source]?.[name]
}

function fmtTime(ms) {
  if (ms == null || !Number.isFinite(ms)) return '—'
  if (ms >= 100) return `${ms.toFixed(0)}ms`
  if (ms >= 10) return `${ms.toFixed(1)}ms`
  if (ms >= 1) return `${ms.toFixed(2)}ms`
  return `${ms.toFixed(3)}ms`
}

function fmtMem(bytes) {
  if (bytes == null || !Number.isFinite(bytes)) return '—'
  if (Math.abs(bytes) < 512 * 1024) return '~0'
  if (Math.abs(bytes) < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

function fmtValue(mean, kind) {
  return kind === 'mem' ? fmtMem(mean) : fmtTime(mean)
}

function fmtPct(latest, base) {
  if (base == null || base === 0 || latest == null) return null
  if (latest === base) return '—'
  const pct = ((latest - base) / Math.abs(base)) * 100
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

/**
 * A change is 🟢/🔴 only when it clears **both** a relative and an absolute
 * floor. Smaller moves are omitted from the cell (not reliable).
 *
 * The relative floor is noise-aware: each vitest bench records an `rme`
 * (relative margin of error, %), and the two compared runs' rme values are
 * summed into the threshold. Time benches also get a 10% base floor because
 * run-to-run variance (JIT/GC/machine state) routinely exceeds the within-run
 * rme on mount-style benches. Memory means have no rme and are stable across
 * runs, so they keep a plain 5% floor.
 */
const TIME_REL_PCT = 10
const MEM_REL_PCT = 5
const TIME_ABS_MS = 1
const MEM_ABS_BYTES = 512 * 1024

function noiseThresholdPct(latest, older, kind) {
  if (kind === 'mem') return MEM_REL_PCT
  return Math.max(TIME_REL_PCT, (latest?.rme ?? 0) + (older?.rme ?? 0))
}

function absFloor(kind) {
  return kind === 'mem' ? MEM_ABS_BYTES : TIME_ABS_MS
}

/**
 * Lower is better. `null` unless the change clears both the noise-aware
 * relative threshold and the absolute floor (1ms time / 0.5 MB heap).
 */
function changeEmoji(latest, older, kind) {
  const mean = latest?.mean
  const base = older?.mean
  if (mean == null || base == null || mean === base || base === 0) {
    return null
  }
  const delta = mean - base
  const pct = (delta / Math.abs(base)) * 100
  if (Math.abs(pct) < noiseThresholdPct(latest, older, kind)) return null
  if (Math.abs(delta) < absFloor(kind)) return null
  return pct < 0 ? '🟢' : '🔴'
}

function fmtPctWithEmoji(latest, older, kind) {
  const emoji = changeEmoji(latest, older, kind)
  if (!emoji) return null
  const pct = fmtPct(latest?.mean, older?.mean)
  if (pct == null || pct === '—') return null
  return `${emoji} ${pct}`
}

function cell(latest, older, kind) {
  if (latest?.mean == null) return '—'
  const value = fmtValue(latest.mean, kind)
  if (older?.mean == null) return value
  const delta = fmtPctWithEmoji(latest, older, kind)
  return delta ? `${value} (${delta})` : value
}

function columnLabel(name) {
  return BENCHES[name]?.label ?? name
}

function columnDesc(name) {
  const bench = BENCHES[name]
  if (!bench) return null
  return `- **${bench.label}** — ${bench.desc}`
}

function namesFor(history, spec) {
  const set = new Set()
  for (const entry of Object.values(history)) {
    for (const name of Object.keys(entry[spec.source] ?? {})) {
      if (!spec.prefix || name.startsWith(spec.prefix)) set.add(name)
    }
  }
  const extra = [...set].filter((n) => !spec.order?.includes(n)).sort()
  return [...(spec.order ?? []).filter((n) => set.has(n)), ...extra]
}

function when(entry) {
  return entry.timestamp.replace('T', ' ').replace(/\.\d{3}Z$/, '')
}

function table(headers, rows) {
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map((h, i) => (i === 0 || h === 'When (UTC)' ? '---' : '---:')).join(' | ')} |`,
  ]
  for (const row of rows) {
    lines.push(`| ${row.join(' | ')} |`)
  }
  return lines
}

/**
 * Rows newest-first, each resolved to the entry it is graded against: rows
 * newer than the base compare to the base, the base row itself is a plain
 * reference (no comparison), and older rows keep comparing to their own
 * previous row so gradings recorded before a rebase stay meaningful.
 */
function commitRows(history) {
  const rows = [...Object.entries(history)].reverse()
  const baseIdx = rows.findIndex(([, entry]) => entry.base)

  return rows.map(([commit, entry], i) => {
    const isBase = i === baseIdx
    const targetIdx = baseIdx !== -1 && i < baseIdx ? baseIdx : i + 1
    const target = isBase ? undefined : rows[targetIdx]
    return {
      commit,
      entry,
      isBase,
      vsCommit: target?.[0],
      vsEntry: target?.[1],
    }
  })
}

function commitCell(row) {
  const name = row.isBase ? `${row.commit} (base)` : row.commit
  return row.vsCommit ? `${name} vs ${row.vsCommit}` : name
}

function summarySection(history, area) {
  const rows = commitRows(history)
  const headers = ['Commit', ...area.summary.map((c) => c.label), 'When (UTC)']
  const body = rows.map((row) => {
    return [
      commitCell(row),
      ...area.summary.map((c) =>
        cell(
          metric(row.entry, c.key, c.name),
          metric(row.vsEntry, c.key, c.name),
          c.kind
        )
      ),
      when(row.entry),
    ]
  })
  return [
    `## ${area.title}`,
    '',
    area.blurb,
    '',
    ...table(headers, body),
    '',
    ...area.summary.map((c) => columnDesc(c.name)).filter(Boolean),
    '',
  ]
}

function subtable(history, spec) {
  const rows = commitRows(history)
  const names = namesFor(history, spec)
  if (!names.length) return []
  const kind = spec.source === 'memory' ? 'mem' : 'time'
  const headers = ['Commit', ...names.map((n) => columnLabel(n)), 'When (UTC)']
  const body = rows.map((row) => {
    return [
      commitCell(row),
      ...names.map((n) =>
        cell(
          metric(row.entry, spec.source, n),
          metric(row.vsEntry, spec.source, n),
          kind
        )
      ),
      when(row.entry),
    ]
  })

  return [
    '<details>',
    `<summary>${spec.title}</summary>`,
    '',
    spec.blurb,
    '',
    ...table(headers, body),
    '',
    ...names.map((n) => columnDesc(n)).filter(Boolean),
    '',
    '</details>',
    '',
  ]
}

/**
 * Writes `results/RESULTS.md` — a summary table plus collapsible per-suite
 * history, newest commit first, each cell % vs the older row below.
 *
 * @param history Commit-keyed results.
 */
export function writeReport(history) {
  mkdirSync(resultsDir, { recursive: true })

  const updated = new Date()
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, ' UTC')

  const lines = [
    '# Runtime Performance',
    '',
    'Growing catalog of internal benches. Each `##` heading is one area',
    '(same idea as `define-schema-500` in types-perf). Rows are git commits;',
    'the Commit column says which run each row is graded against (`X vs Y`).',
    '**Lower is better.**',
    '',
    'Rows newer than the `(base)` row all compare to the base; the base row',
    'itself is the ungraded reference, and older rows compare to their own',
    'previous row (their gradings predate the rebase). `pnpm perf:rebase`',
    'promotes the newest row to base.',
    '',
    '🟢 / 🔴 only when the change beats the bench’s own noise: for time,',
    '≥ max(10%, sum of the two runs’ error margins) **and** ≥1ms; for heap,',
    '≥5% **and** ≥0.5 MB. Anything smaller is omitted as not reliable.',
    '',
    'Time = mean duration. Heap = bytes still alive after forced GC.',
    '',
    '- `pnpm bench:perf` → run and record this commit',
    '- `pnpm bench:perf:save` → also snapshot `baseline.json` for before/after',
    '- `pnpm bench:perf:report` → regenerate this file',
    '- `pnpm perf:rebase` → make the newest row the new base',
    '',
    `_Last updated: ${updated}_`,
    '',
  ]

  if (!Object.keys(history).length) {
    lines.push('_No results yet._', '')
    writeFileSync(reportPath, `${lines.join('\n')}\n`)
    return
  }

  for (const area of AREAS) {
    lines.push(...summarySection(history, area))
    for (const spec of area.tables) {
      lines.push(...subtable(history, spec))
    }
  }

  writeFileSync(reportPath, `${lines.join('\n')}\n`)
}
