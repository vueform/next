import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import {
  createPrompt,
  useState,
  useKeypress,
  usePrefix,
  isUpKey,
  isDownKey,
  isSpaceKey,
  isEnterKey,
} from '@inquirer/core'
import { select } from '@inquirer/prompts'
import {
  DOCS_DIR,
  ALL_GENERATORS,
  JSON_TO_GENERATOR,
  PAGE_TO_GENERATOR,
  WAVES,
  resolveDeps,
  runSequential,
  runParallelWave,
  type Generator,
} from './gen'

const LAST_CMD_PATH = path.join(DOCS_DIR, '.last-gen.json')
const SETTINGS_PATH = path.join(DOCS_DIR, 'scripts', 'settings.json')

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

interface GeneratorSetting {
  full?: boolean
  cli?: boolean
}

const SETTINGS: Record<string, GeneratorSetting> = fs.existsSync(SETTINGS_PATH)
  ? JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'))
  : {}

function isEnabled(gen: Generator, key: 'full' | 'cli'): boolean {
  return SETTINGS[gen]?.[key] !== false
}

function cliJsonFiles(): string[] {
  return Object.entries(JSON_TO_GENERATOR)
    .filter(([, gen]) => isEnabled(gen, 'cli'))
    .map(([file]) => file)
    .sort()
}

function cliPageGroups(): string[] {
  return Object.entries(PAGE_TO_GENERATOR)
    .filter(([, gen]) => isEnabled(gen, 'cli'))
    .map(([group]) => group)
}

function cliGenerators(): Generator[] {
  return ALL_GENERATORS.filter((g) => isEnabled(g, 'cli'))
}

function fullWaves(): Generator[][] {
  return WAVES.map((wave) => wave.filter((g) => isEnabled(g, 'full'))).filter(
    (wave) => wave.length > 0
  )
}

// ---------------------------------------------------------------------------
// Smart checkbox: Enter on highlighted item selects it if nothing is checked
// ---------------------------------------------------------------------------

interface SmartCheckboxChoice {
  name: string
  value: string
}

const smartCheckbox = createPrompt<
  string[],
  { message: string; choices: SmartCheckboxChoice[] }
>((config, done) => {
  const { choices } = config
  const [cursor, setCursor] = useState(0)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [done_, setDone] = useState(false)
  const prefix = usePrefix({})

  useKeypress((key) => {
    if (done_) return

    if (isEnterKey(key)) {
      setDone(true)
      if (checked.size > 0) {
        done([...checked].sort((a, b) => a - b).map((i) => choices[i].value))
      } else {
        done([choices[cursor].value])
      }
    } else if (isUpKey(key)) {
      setCursor(cursor <= 0 ? choices.length - 1 : cursor - 1)
    } else if (isDownKey(key)) {
      setCursor(cursor >= choices.length - 1 ? 0 : cursor + 1)
    } else if (isSpaceKey(key)) {
      const next = new Set(checked)
      if (next.has(cursor)) next.delete(cursor)
      else next.add(cursor)
      setChecked(next)
    }
  })

  const lines = choices.map((choice, i) => {
    const isChecked = checked.has(i)
    const isCursor = i === cursor
    const pointer = isCursor ? '\x1b[36m❯\x1b[0m' : ' '
    const box = isChecked ? '\x1b[32m◉\x1b[0m' : '◯'
    const label = isCursor ? `\x1b[36m${choice.name}\x1b[0m` : choice.name
    return `${pointer} ${box} ${label}`
  })

  const hint =
    checked.size === 0
      ? '\x1b[2m(enter = run highlighted, space = toggle, arrows = move)\x1b[0m'
      : '\x1b[2m(enter = run selected, space = toggle, arrows = move)\x1b[0m'

  return `${prefix} ${config.message} ${hint}\n${lines.join('\n')}`
})

// ---------------------------------------------------------------------------
// Last command persistence
// ---------------------------------------------------------------------------

function saveLastCommand(generators: Generator[]): void {
  try {
    fs.writeFileSync(LAST_CMD_PATH, JSON.stringify(generators))
  } catch {}
}

function loadLastCommand(): Generator[] | null {
  try {
    const data = JSON.parse(fs.readFileSync(LAST_CMD_PATH, 'utf-8'))
    if (Array.isArray(data)) {
      // Drop generators that no longer exist (e.g. the ones moved into
      // packages/scraper) from commands saved before the move.
      const known = data.filter((g) =>
        (ALL_GENERATORS as readonly string[]).includes(g)
      )
      if (known.length > 0) return known as Generator[]
    }
  } catch {}
  return null
}

// ---------------------------------------------------------------------------
// Menu: Regenerate JSON data
// ---------------------------------------------------------------------------

async function menuJson() {
  const jsonFiles = cliJsonFiles()

  const selected = await smartCheckbox({
    message: 'Select JSON files to regenerate',
    choices: [
      { name: 'Generate all', value: '__all__' },
      ...jsonFiles.map((f) => ({ name: f, value: f })),
    ],
  })

  const files = selected.includes('__all__') ? jsonFiles : selected
  const generators = [...new Set(files.map((f) => JSON_TO_GENERATOR[f]))]
  const ordered = resolveDeps(generators)

  console.log(`\nWill run: ${ordered.join(' → ')}`)
  saveLastCommand(ordered)
  runSequential(ordered)
}

// ---------------------------------------------------------------------------
// Menu: Regenerate doc pages
// ---------------------------------------------------------------------------

async function menuPages() {
  const pageGroups = cliPageGroups()

  const selected = await smartCheckbox({
    message: 'Select page groups to regenerate',
    choices: [
      { name: 'Generate all', value: '__all__' },
      ...pageGroups.map((g) => ({ name: g, value: g })),
    ],
  })

  const groups = selected.includes('__all__') ? pageGroups : selected
  const generators = [...new Set(groups.map((g) => PAGE_TO_GENERATOR[g]))]
  const ordered = resolveDeps(generators)

  console.log(`\nWill run: ${ordered.join(' → ')}`)
  saveLastCommand(ordered)
  runSequential(ordered)
}

// ---------------------------------------------------------------------------
// Menu: Run specific generators
// ---------------------------------------------------------------------------

async function menuGenerators() {
  const selected = (await smartCheckbox({
    message: 'Select generators to run',
    choices: cliGenerators()
      .slice()
      .sort()
      .map((g) => ({ name: g, value: g })),
  })) as Generator[]

  const ordered = resolveDeps(selected)

  if (ordered.length > selected.length) {
    const deps = ordered.filter((g) => !selected.includes(g))
    console.log(`\nAuto-adding dependencies: ${deps.join(', ')}`)
  }

  console.log(`\nWill run: ${ordered.join(' → ')}`)
  saveLastCommand(ordered)
  runSequential(ordered)
}

// ---------------------------------------------------------------------------
// Full rebuild (scrape + parallel waves)
// ---------------------------------------------------------------------------

async function fullRebuild() {
  const waves = fullWaves()
  if (waves.length === 0) {
    console.log('\nNo generators enabled for a full run in settings.json')
    return
  }

  const start = Date.now()
  saveLastCommand(waves.flat())

  // The docs generators read the structural jsons scraped into .generated/
  // at the monorepo root, so refresh those first.
  console.log(
    '\n\x1b[35m━━━ Scraping structural jsons (pnpm scrape) ━━━\x1b[0m'
  )
  execSync('pnpm run scrape', {
    cwd: path.resolve(DOCS_DIR, '..'),
    stdio: 'inherit',
  })

  for (let i = 0; i < waves.length; i++) {
    const wave = waves[i]
    console.log(
      `\n\x1b[35m━━━ Wave ${i} (${wave.length} generators in parallel) ━━━\x1b[0m`
    )
    await runParallelWave(wave)
    console.log(`\x1b[32m✓ Wave ${i} complete\x1b[0m`)
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log(`\n\x1b[32m✓ Full rebuild done in ${elapsed}s\x1b[0m`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const lastCmd = loadLastCommand()

  const choices: { name: string; value: string }[] = []

  if (cliJsonFiles().length) {
    choices.push({ name: 'Regenerate JSON data', value: 'json' })
  }
  if (cliPageGroups().length) {
    choices.push({ name: 'Regenerate doc pages', value: 'pages' })
  }
  if (cliGenerators().length) {
    choices.push({ name: 'Run specific generators', value: 'generators' })
  }
  if (fullWaves().length) {
    choices.push({ name: 'Full rebuild', value: 'rebuild' })
  }

  if (lastCmd) {
    choices.push({ name: 'Repeat last command', value: 'repeat' })
  }

  if (choices.length === 0) {
    console.log('\nNo generators enabled in settings.json')
    return
  }

  const action = await select({ message: 'What do you want to do?', choices })

  switch (action) {
    case 'json':
      return menuJson()
    case 'pages':
      return menuPages()
    case 'generators':
      return menuGenerators()
    case 'rebuild':
      return fullRebuild()
    case 'repeat':
      return runSequential(lastCmd!)
  }
}

main().catch((err) => {
  if (err.name === 'ExitPromptError') {
    process.exit(0)
  }
  console.error(err)
  process.exit(1)
})
