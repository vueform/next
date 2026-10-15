/**
 * Release orchestrator (`pnpm release` → CI entrypoint of release.yml, also
 * locally runnable). Computes the next lockstep version, writes it to every
 * `packages/*` manifest, rebuilds (dist banners stamp the version at build
 * time), regenerates the git-tracked release artifacts (adapter registries,
 * README size sections, benchmark results), regenerates CHANGELOG.md and
 * emits the new section for the GitHub release notes, then commits
 * `chore(release): v<version>` and tags `v<version>`.
 *
 *   tsx scripts/release.ts [--bump auto|patch|minor|major]
 *                          [--pre rehearsal|alpha|beta|rc|none] [--dry]
 *                          [--skip registry,size,bench]
 *
 * `--skip` leaves the named regen steps out (the workflow forwards its skip
 * checkboxes here); skipped artifacts ship in the release commit as they
 * already are on the branch.
 *
 * `--pre rehearsal` is a full dress run: the next `x.y.z-0.N` is resolved
 * from the npm registry (never from git), and regen, changelog, notes and
 * the release commit all run exactly like a real release — EXCEPT the git
 * tag, which rehearsals never create (v-tags seed the next real version
 * computation; CI publishes a draft GitHub release instead, which mints no
 * tag either). `--pre none` promotes to a
 * stable version on the `latest` dist-tag. Switching prerelease ids always
 * restarts at `.1` of the new id, so rehearsal versions never leak into the
 * alpha line.
 *
 * Hard guard: a prerelease version is refused unless its dist-tag is
 * non-`latest`. `--dry` prints every decision and writes nothing.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import semver from 'semver'

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)

type Bump = 'auto' | 'patch' | 'minor' | 'major'
type Pre = 'rehearsal' | 'alpha' | 'beta' | 'rc' | 'none'

/** The prerelease identifier of the rehearsal channel: `x.y.z-0.N`. Numeric,
 * so it sorts below every alpha/beta/rc and is never matched by ranges. */
const REHEARSAL_PREID = '0'
/** Registry probe package — all 9 are lockstepped, one lookup suffices. */
const PROBE_PACKAGE = '@vueform/core'

const args = process.argv.slice(2)
const readFlag = (name: string, allowed: readonly string[]): string => {
  const index = args.indexOf(`--${name}`)
  if (index === -1) return allowed[0]
  const value = args[index + 1]
  if (!value || !allowed.includes(value)) {
    console.error(`--${name} must be one of: ${allowed.join(', ')}`)
    process.exit(1)
  }
  return value
}

const bump = readFlag('bump', ['auto', 'patch', 'minor', 'major']) as Bump
const pre = readFlag('pre', ['alpha', 'rehearsal', 'beta', 'rc', 'none']) as Pre
const dry = args.includes('--dry')

const SKIPPABLE = ['registry', 'size', 'bench'] as const
type Skippable = (typeof SKIPPABLE)[number]
const skip = ((): Set<Skippable> => {
  const index = args.indexOf('--skip')
  if (index === -1) return new Set()
  const entries = (args[index + 1] ?? '').split(',').filter(Boolean)
  for (const entry of entries) {
    if (!(SKIPPABLE as readonly string[]).includes(entry)) {
      console.error(`--skip entries must be of: ${SKIPPABLE.join(', ')}`)
      process.exit(1)
    }
  }
  return new Set(entries as Skippable[])
})()

const distTag = pre === 'none' ? 'latest' : pre

/** Long-running build/regen step: streams output, fails the release on error. */
const runLive = (command: string, runArgs: string[]) => {
  const result = spawnSync(command, runArgs, {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  if (result.status !== 0) {
    console.error(`Command failed: ${command} ${runArgs.join(' ')}`)
    process.exit(1)
  }
}

const run = (command: string, runArgs: string[], allowFailure = false) => {
  const result = spawnSync(command, runArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  if (result.status !== 0 && !allowFailure) {
    console.error(result.stderr || result.stdout)
    console.error(`Command failed: ${command} ${runArgs.join(' ')}`)
    process.exit(1)
  }
  return result.status === 0 ? result.stdout.trim() : ''
}

const packageDirs = fs
  .readdirSync(path.join(repoRoot, 'packages'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(repoRoot, 'packages', entry.name))
  .filter((dir) => fs.existsSync(path.join(dir, 'package.json')))

const readManifest = (dir: string) =>
  JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')) as {
    name: string
    version: string
  }

/** Stable base (`x.y.z` with any prerelease stripped) of the lockstep line,
 * taken from the manifests — the single source of the target major. */
const manifestBase = (() => {
  const version = readManifest(packageDirs[0]).version
  const parsed = semver.parse(version)
  if (!parsed) {
    console.error(`Unparseable version in ${packageDirs[0]}: ${version}`)
    process.exit(1)
  }
  return `${parsed.major}.${parsed.minor}.${parsed.patch}`
})()

/** Latest release tag, or null before the first release. */
const latestTag = (() => {
  const tags = run('git', ['tag', '--list', 'v*', '--sort=-v:refname'])
  return tags === '' ? null : tags.split('\n')[0]
})()

const recommendedBump = (): 'patch' | 'minor' | 'major' => {
  if (bump !== 'auto') return bump
  const out = run('pnpm', [
    'exec',
    'conventional-recommended-bump',
    '-p',
    'conventionalcommits',
  ])
  const level = out.split('\n').pop()?.trim()
  if (level !== 'patch' && level !== 'minor' && level !== 'major') {
    console.error(`conventional-recommended-bump returned: ${out}`)
    process.exit(1)
  }
  return level
}

/** Next rehearsal version: highest published `-0.N` on the probe package
 * plus one. Registry-sourced on purpose — rehearsal runs never create git
 * state, so git knows nothing about them. */
const nextRehearsal = (): string => {
  const out = run(
    'npm',
    ['view', PROBE_PACKAGE, 'versions', '--json'],
    /* allowFailure: unpublished name responds E404 */ true
  )
  let published: string[] = []
  try {
    const parsed = JSON.parse(out) as string[] | string
    published = Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    published = []
  }
  const pattern = new RegExp(
    `^${manifestBase.replaceAll('.', '\\.')}-${REHEARSAL_PREID}\\.(\\d+)$`
  )
  const highest = published
    .map((version) => pattern.exec(version)?.[1])
    .filter((n): n is string => n !== undefined)
    .reduce((max, n) => Math.max(max, Number(n)), 0)
  return `${manifestBase}-${REHEARSAL_PREID}.${highest + 1}`
}

const nextVersion = (): string => {
  if (pre === 'rehearsal') return nextRehearsal()

  if (latestTag === null) {
    // First release ever: the manifests already carry the intended base.
    return pre === 'none' ? manifestBase : `${manifestBase}-${pre}.1`
  }

  const current = semver.parse(latestTag.slice(1))
  if (!current) {
    console.error(`Unparseable latest tag: ${latestTag}`)
    process.exit(1)
  }

  if (pre === 'none') {
    // Promote a prerelease line as-is; bump a stable release by commits.
    if (current.prerelease.length > 0)
      return `${current.major}.${current.minor}.${current.patch}`
    return semver.inc(current.version, recommendedBump()) as string
  }

  if (current.prerelease[0] === pre) {
    // Same channel: alpha.N → alpha.N+1.
    return semver.inc(current.version, 'prerelease', pre) as string
  }
  if (current.prerelease.length > 0) {
    // Channel switch (alpha → beta): keep the base, restart at .1.
    return `${current.major}.${current.minor}.${current.patch}-${pre}.1`
  }
  // Prerelease after a stable release: bump the base by commits first.
  const base = semver.inc(current.version, recommendedBump()) as string
  return `${base}-${pre}.1`
}

const version = nextVersion()
const tag = `v${version}`

// Hard guard: a prerelease must never ride the `latest` dist-tag.
if (semver.prerelease(version) !== null && distTag === 'latest') {
  console.error(
    `Refusing to release prerelease ${version} on dist-tag "latest" — pass a non-latest --pre channel.`
  )
  process.exit(1)
}

console.log(`version:  ${version}`)
console.log(`dist-tag: ${distTag}`)
console.log(
  `mode:     ${pre === 'rehearsal' ? 'rehearsal (tagless dress run)' : 'release'}${dry ? ' [dry]' : ''}`
)

const notesFile = path.join(repoRoot, '.vueform', 'release-notes.md')

// Hand the results to the workflow when running inside GitHub Actions.
// Written before the dry exit so dry runs fill the job summary too.
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `version=${version}\ndist_tag=${distTag}\nnotes_file=${notesFile}\nrehearsal=${pre === 'rehearsal'}\n`
  )
}

/** The handwritten or generated section for this version, for `gh release`. */
const extractFirstSection = (changelog: string): string => {
  const sections = changelog
    .split(/^(?=## )/m)
    .filter((s) => s.startsWith('## '))
  return (sections[0] ?? changelog).trim()
}

const writeVersions = () => {
  for (const dir of packageDirs) {
    const file = path.join(dir, 'package.json')
    const source = fs.readFileSync(file, 'utf8')
    const updated = source.replace(
      /^(\s*"version":\s*)"[^"]+"/m,
      `$1"${version}"`
    )
    if (updated === source && !source.includes(`"version": "${version}"`)) {
      console.error(`No version field found in ${file}`)
      process.exit(1)
    }
    fs.writeFileSync(file, updated)
    console.log(`bumped:   ${readManifest(dir).name}`)
  }
}

if (dry) {
  console.log('\n--dry: no files written, no changelog, no commit, no tag.')
  process.exit(0)
}

writeVersions()

// Sync the publish-time manifest fields (publishConfig.exports/imports —
// see scripts/manifests.ts); not run automatically anywhere else.
runLive('pnpm', ['manifests'])

// Rebuild with the bumped version — dist banners stamp it at build time.
runLive('pnpm', ['build'])

// Regenerate the git-tracked release artifacts so the release commit ships
// them at the release version: adapter registries, README size sections,
// benchmark results + charts — minus the --skip'd generators.
for (const task of SKIPPABLE) {
  if (skip.has(task)) {
    console.log(`skipped:  ${task} (--skip)`)
  } else {
    runLive('pnpm', [task])
  }
}

const changelogFile = path.join(repoRoot, 'CHANGELOG.md')
const pkgFlag = ['--pkg', path.join(packageDirs[0], 'package.json')]

if (latestTag === null) {
  // First release: the CHANGELOG entry is handwritten (see the release
  // plan) — generation starts from the second release, anchored on this
  // run's tag. Only the notes are extracted here.
  if (!fs.existsSync(changelogFile)) {
    console.error(
      'CHANGELOG.md is missing. The first release ships a handwritten entry — add it before releasing.'
    )
    process.exit(1)
  }
} else {
  run('pnpm', [
    'exec',
    'conventional-changelog',
    '-p',
    'conventionalcommits',
    '-i',
    changelogFile,
    '-s',
    ...pkgFlag,
  ])
  console.log('changelog: CHANGELOG.md updated')
}

fs.mkdirSync(path.dirname(notesFile), { recursive: true })
fs.writeFileSync(
  notesFile,
  extractFirstSection(fs.readFileSync(changelogFile, 'utf8')) + '\n'
)
console.log(`notes:    ${path.relative(repoRoot, notesFile)}`)

// Manifests, CHANGELOG, registries, README size sections, bench results.
run('git', ['add', '-A'])
run('git', ['commit', '-m', `chore(release): ${tag}`])

// A rehearsal is tagless on purpose: v-tags seed the next real version
// computation, so a v`x.y.z-0.N` tag could mis-order the real release line.
// CI creates a DRAFT GitHub release for rehearsals, which also mints no tag.
if (pre !== 'rehearsal') {
  run('git', ['tag', '-a', tag, '-m', tag])
  console.log(`tagged:   ${tag}`)
}
