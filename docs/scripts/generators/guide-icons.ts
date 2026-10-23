import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Generates the downloadable default-icon archive linked from the security
 * guide's CSP section (`docs/src/public/icons/vueform-icons.zip`). Every
 * adapter's theme objects are imported from its built dist, every
 * `url("data:image/svg+xml,...")` token value is decoded into an `.svg` file,
 * and the files are zipped together with a generated README mapping each file
 * to its token. (Today only the ui themes carry data-URI icons — primevue
 * icons are PrimeIcons font classes — but an adapter that gains some lands in
 * the archive with no generator change.)
 *
 * The archive is committed, so output is byte-stable: fixed timestamps and
 * sorted entries — a rerun only changes it when the icons themselves change.
 */
import { zipSync, strToU8 } from 'fflate'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(SCRIPT_DIR, '..', '..')
const OUT_DIR = path.join(DOCS_ROOT, 'src/public/icons')

const GUIDE_URL = 'https://vueform.com/guide/security#content-security-policy'

/** Zip entry timestamp, fixed so reruns produce byte-identical archives. */
const FIXED_MTIME = new Date('2000-01-01T00:00:00Z')

interface AdapterSource {
  name: string
  module: string
  /** Named theme exports to scan from the adapter's `./themes` entry. */
  themes: string[]
}

const ADAPTERS: AdapterSource[] = [
  { name: 'ui', module: '@vueform/ui/themes', themes: ['origin', 'material'] },
  { name: 'primevue', module: '@vueform/primevue/themes', themes: ['theme'] },
]

interface IconFile {
  /** File name inside the archive (kebab-cased token path). */
  file: string
  /** Token path as configured (`iconAdd`, `dark.selectIconCaret`). */
  token: string
  svg: string
}

/**
 * Decodes a `url("data:image/svg+xml,...")` CSS value into SVG markup, or
 * `null` when the value isn't one.
 */
function decodeDataUri(value: string): string | null {
  const match = value.match(
    /^url\((["']?)data:image\/svg\+xml(?:;utf8)?,(.*)\1\)$/s
  )

  if (!match) return null

  try {
    return match[2].includes('%') ? decodeURIComponent(match[2]) : match[2]
  } catch {
    return null
  }
}

function toKebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Collects the data-URI icon tokens of one theme object. Nested objects (the
 * `dark` block) recurse with their key as a token-path prefix and a file-name
 * suffix (`dark.selectIconCaret` → `select-icon-caret-dark.svg`).
 */
function collectIcons(
  theme: Record<string, unknown>,
  tokenPrefix: string,
  fileSuffix: string,
  into: Map<string, IconFile>
): void {
  for (const [key, value] of Object.entries(theme)) {
    if (value && typeof value === 'object') {
      collectIcons(
        value as Record<string, unknown>,
        `${tokenPrefix}${key}.`,
        `${fileSuffix}-${toKebab(key)}`,
        into
      )
      continue
    }

    if (typeof value !== 'string') continue

    const svg = decodeDataUri(value)

    if (svg == null) continue

    const token = `${tokenPrefix}${key}`
    const file = `${toKebab(key)}${fileSuffix}.svg`
    const existing = into.get(file)

    // Themes of one adapter share the core token groups, so duplicates are
    // expected — but a theme redefining an icon with different markup must
    // not silently lose one variant. Decide the naming then, consciously.
    if (existing && existing.svg !== svg) {
      console.error(
        `[icons] Conflicting SVG for \`${token}\` across themes — extend the generator with per-theme naming.`
      )
      process.exit(1)
    }

    into.set(file, { file, token, svg })
  }
}

function renderReadme(icons: IconFile[]): string {
  const configurable = icons.filter((icon) => !icon.token.includes('.'))

  const snippet = configurable
    .map((icon) => `    ${icon.token}: 'url("/icons/${icon.file}")',`)
    .join('\n')

  const table = icons
    .map((icon) => `| \`${icon.token}\` | ${icon.file} |`)
    .join('\n')

  return `# Vueform Default Icons

These are the default icon SVGs of Vueform's built-in themes, extracted from the \`data:image/svg+xml\` URLs the theme tokens ship with. Use them when your Content Security Policy forbids \`img-src data:\` — host them as same-origin assets and point the tokens at them, and your forms keep the default looks without the \`data:\` directive.

Copy the files into your app's public assets (for example \`public/icons/\`), then override the tokens:

\`\`\`js
createVueform({
  tokens: {
${snippet}
  },
})
\`\`\`

A \`dark.\`-prefixed token below is the dark token set's default — override it inside your dark tokens the same way.

| Token | File |
| --- | --- |
${table}

Icons drawn in \`currentColor\` take their color from your theme; a file with a fixed color is safe to edit to match yours.

The Content Security Policy details live in the security guide: ${GUIDE_URL}
`
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const icons = new Map<string, IconFile>()

  for (const adapter of ADAPTERS) {
    let themes: Record<string, unknown>

    try {
      themes = await import(adapter.module)
    } catch (error) {
      console.error(
        `[icons] Failed to import \`${adapter.module}\` — build the packages first (\`pnpm build\` at the monorepo root).`
      )
      console.error(`[icons] ${error}`)
      process.exit(1)
    }

    for (const themeName of adapter.themes) {
      const theme = themes[themeName]

      if (!theme || typeof theme !== 'object') {
        console.error(
          `[icons] \`${adapter.module}\` has no \`${themeName}\` export.`
        )
        process.exit(1)
      }

      collectIcons(theme as Record<string, unknown>, '', '', icons)
    }
  }

  const outFile = path.join(OUT_DIR, 'vueform-icons.zip')
  const sorted = [...icons.values()].sort((a, b) =>
    a.file.localeCompare(b.file)
  )

  if (!sorted.length) {
    console.error(
      '[icons] No data-URI icons found in any theme — the guide links an archive that would be empty.'
    )
    process.exit(1)
  }

  const entries: Record<string, [Uint8Array, { mtime: Date }]> = {}

  for (const icon of sorted) {
    entries[icon.file] = [strToU8(`${icon.svg}\n`), { mtime: FIXED_MTIME }]
  }

  entries['README.md'] = [strToU8(renderReadme(sorted)), { mtime: FIXED_MTIME }]

  const zipped = zipSync(entries, { level: 9, mtime: FIXED_MTIME })

  const current = fs.existsSync(outFile) ? fs.readFileSync(outFile) : null

  if (current && current.equals(Buffer.from(zipped))) {
    console.log(`[icons] No changes (${sorted.length} icons).`)
    return
  }

  fs.writeFileSync(outFile, zipped)
  console.log(
    `[icons] Wrote ${path.relative(DOCS_ROOT, outFile)} (${sorted.length} icons).`
  )
}

main()
