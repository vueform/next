/**
 * Markdown table compactor (`pnpm fmt:md`, lint-staged `*.md`): rewrites GFM
 * tables to compact form — one space around each cell, delimiter cells
 * reduced to `---`/`:--`/`--:`/`:-:` — instead of column-aligned padding.
 * Only table blocks are touched (a `|…|` row followed by a delimiter row),
 * fenced code blocks are skipped, everything else passes through verbatim.
 *
 * Files to rewrite come as arguments; with none, every `.md` under
 * `docs/src/guide` is processed. Changed files are rewritten in place and
 * listed; unchanged files are left alone.
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')

// Split a `| a | b |` row on pipes that are not escaped with a backslash.
// GFM treats unescaped pipes as cell delimiters even inside code spans, so
// no inline-code tracking is needed.
function splitRow(line: string): string[] | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|') || trimmed.length < 2)
    return null
  const cells: string[] = []
  let cell = ''
  for (let i = 1; i < trimmed.length; i++) {
    const ch = trimmed[i]
    if (ch === '\\' && trimmed[i + 1] === '|') {
      cell += '\\|'
      i++
    } else if (ch === '|') {
      cells.push(cell.trim())
      cell = ''
    } else {
      cell += ch
    }
  }
  return cells
}

function isDelimiterRow(cells: string[] | null): boolean {
  return !!cells?.length && cells.every((c) => /^:?-+:?$/.test(c))
}

function compactDelimiterCell(cell: string): string {
  const left = cell.startsWith(':')
  const right = cell.endsWith(':')
  if (left && right) return ':-:'
  if (left) return ':--'
  if (right) return '--:'
  return '---'
}

function joinRow(cells: string[]): string {
  return `| ${cells.join(' | ')} |`
}

function compactTables(source: string): string {
  const lines = source.split('\n')
  const out: string[] = []
  let inFence = false
  let fenceMarker = ''
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const fence = line.match(/^\s*(`{3,}|~{3,})/)?.[1]
    if (fence) {
      if (!inFence) {
        inFence = true
        fenceMarker = fence[0]
      } else if (fence[0] === fenceMarker) {
        inFence = false
      }
      out.push(line)
      continue
    }
    if (inFence) {
      out.push(line)
      continue
    }
    const header = splitRow(line)
    const delimiter =
      header && i + 1 < lines.length ? splitRow(lines[i + 1]) : null
    if (!header || !isDelimiterRow(delimiter)) {
      out.push(line)
      continue
    }
    out.push(joinRow(header))
    out.push(joinRow(delimiter!.map(compactDelimiterCell)))
    i += 2
    for (; i < lines.length; i++) {
      const row = splitRow(lines[i])
      if (!row) break
      out.push(joinRow(row))
    }
    i--
  }
  return out.join('\n')
}

function listGuideFiles(): string[] {
  const dir = path.join(root, 'docs/src/guide')
  return fs
    .readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(dir, f))
}

const files = process.argv.slice(2).filter((f) => f.endsWith('.md'))
const targets = files.length
  ? files.map((f) => path.resolve(f))
  : listGuideFiles()

for (const file of targets) {
  const source = fs.readFileSync(file, 'utf8')
  const compacted = compactTables(source)
  if (compacted !== source) {
    fs.writeFileSync(file, compacted)
    console.log(path.relative(root, file))
  }
}
