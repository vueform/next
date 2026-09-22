/**
 * Validates the assembled `.generated/` trees against the json schemas in
 * schemas/. Run with `pnpm validate` in packages/scraper after a scrape.
 *
 * Accepts the same source scope flags as `pnpm scrape` (default: all):
 * `--core`, `--adapter=x,y` / `-a=x,y`, `--ui`, `--pv` / `--primevue`.
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

import Ajv from 'ajv'

import { printIssues, scopedIssues } from '../lib/issues'
import { FILES } from '../lib/output'
import { generatedDir, pkgRoot } from '../lib/paths'
import { parseScope } from '../lib/scope'

const SCHEMAS_DIR = path.join(pkgRoot, 'schemas')

const ajv = new Ajv({ allErrors: false, strict: false })

// Shared definitions the file schemas $ref into.
ajv.addSchema(
  JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'common.json'), 'utf-8'))
)

const { scope, rest } = parseScope(process.argv.slice(2))
if (rest.length) {
  console.error(`Unknown argument(s): ${rest.join(', ')}`)
  process.exit(1)
}

const folders = [...(scope.core ? ['core'] : []), ...scope.adapters]
let failures = 0
let checked = 0

for (const name of FILES) {
  const schemaFile = path.join(SCHEMAS_DIR, `${name}.json`)
  if (!fs.existsSync(schemaFile)) {
    console.warn(`[validate] no schema for ${name}.json, skipped`)
    continue
  }

  const validate = ajv.compile(JSON.parse(fs.readFileSync(schemaFile, 'utf-8')))

  for (const folder of folders) {
    const file = path.join(generatedDir, folder, `${name}.json`)
    if (!fs.existsSync(file)) {
      console.warn(
        `[validate] ${folder}/${name}.json missing — run \`pnpm scrape\` first`
      )
      failures++
      continue
    }

    checked++
    if (!validate(JSON.parse(fs.readFileSync(file, 'utf-8')))) {
      failures++
      console.error(`[validate] ${folder}/${name}.json:`)
      for (const err of (validate.errors ?? []).slice(0, 5)) {
        console.error(`  ${err.instancePath || '/'} ${err.message}`)
      }
    }
  }
}

// --- from-ref integrity ---------------------------------------------------
// Every `from` reference (`<file>.<entry>[.<member>…]`) must point at an
// entry that exists in the same folder's tree, so a scraper emitting a
// reference to a local closure or a renamed export fails loudly here.

function collectRefs(
  value: unknown,
  path: string,
  out: { path: string; ref: string }[]
): void {
  if (Array.isArray(value)) {
    value.forEach((item, i) => collectRefs(item, `${path}[${i}]`, out))
    return
  }
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value)) {
    if (key === 'from' && typeof child === 'string') {
      out.push({ path, ref: child })
    } else {
      collectRefs(child, `${path}.${key}`, out)
    }
  }
}

let refs = 0

for (const folder of folders) {
  const data: Record<string, any> = {}
  for (const name of FILES) {
    const file = path.join(generatedDir, folder, `${name}.json`)
    if (fs.existsSync(file)) {
      data[name] = JSON.parse(fs.readFileSync(file, 'utf-8'))
    }
  }

  const collected: { path: string; ref: string }[] = []
  for (const [name, json] of Object.entries(data)) {
    collectRefs(json, `${folder}/${name}.json`, collected)
  }

  for (const { path: at, ref } of collected) {
    refs++
    const [file, entry, member] = ref.split('.')

    const target = data[file]
    if (!target) {
      failures++
      console.error(`[validate] ${at}: from "${ref}" — no ${file}.json`)
      continue
    }
    if (!entry || !(entry in target)) {
      failures++
      console.error(
        `[validate] ${at}: from "${ref}" — no entry "${entry}" in ${file}.json`
      )
      continue
    }
    // contexts.json nests context name → export name; check one level deeper.
    if (file === 'contexts' && member && !(member in target[entry])) {
      failures++
      console.error(
        `[validate] ${at}: from "${ref}" — no export "${member}" in contexts.${entry}`
      )
    }
  }
}

// --- collected issues (warning) ---------------------------------------------
// The scrapers write everything wanting documentation to
// `.generated/issues.json`; `pnpm scrape:issues` prints the same report.

const issues = scopedIssues(scope)
const undocumented = issues.length
if (undocumented) printIssues(issues)

if (failures) {
  console.error(`\n[validate] ${failures} failure(s)`)
  process.exit(1)
}

console.log(
  `[validate] ${checked} file(s) valid, ${refs} from-ref(s) resolved` +
    (undocumented ? `, ${undocumented} undocumented item(s)` : '')
)
