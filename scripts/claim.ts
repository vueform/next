/**
 * npm name claimer (`pnpm claim`, locally runnable — publishing needs an npm
 * account with rights on the @vueform scope; a 2FA OTP prompt comes through
 * interactively). For every `packages/*` manifest it checks whether the name
 * exists on the registry and, when it does not, claims it by publishing the
 * package's CURRENT content at its CURRENT manifest version on the `claim`
 * dist-tag — meant to run right before a first real release, so publishing
 * what is on disk is fine (build first if the tarball should carry dist/).
 *
 * Caveats: the registry sets `latest` on a name's FIRST publish regardless
 * of --tag, so the claimed content serves `latest` until a real release
 * retags it. And the claim burns the manifest version on npm: a later
 * release computing that same version will find it already published (the
 * release workflow then skips it as visible), so claim before versions are
 * final, or bump afterwards.
 *
 * Nothing publishes without consent: unclaimed names are listed and claimed
 * only after a y/N prompt (or with --yes); outside a terminal the script
 * prints what to run and fails instead.
 *
 *   tsx scripts/claim.ts [--dry] [--yes]
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)

const CLAIM_TAG = 'claim'

const dry = process.argv.includes('--dry')
const yes = process.argv.includes('--yes')

const packageDirs = fs
  .readdirSync(path.join(repoRoot, 'packages'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(repoRoot, 'packages', entry.name))
  .filter((dir) => fs.existsSync(path.join(dir, 'package.json')))

const readManifest = (dir: string) =>
  JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')) as {
    name: string
    version: string
    private?: boolean
  }

/** The manual equivalent of what claim() runs — printed when declining. */
const publishCommand = (name: string) =>
  `pnpm --filter "${name}" publish --tag ${CLAIM_TAG} --access public --no-git-checks`

/** true = the name exists on the registry (any version), false = E404. Any
 * other failure (auth, network, invalid name) aborts — guessing "unclaimed"
 * there could publish over a transient error. */
const isClaimed = (name: string): boolean => {
  const result = spawnSync('npm', ['view', name, 'name', '--json'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  if (result.status === 0) return true
  if ((result.stdout + result.stderr).includes('E404')) return false
  console.error(result.stderr || result.stdout)
  console.error(`npm view failed for ${name} with a non-404 error.`)
  process.exit(1)
}

/** Publishes the package as-is via pnpm (which resolves `workspace:` deps);
 * stdio inherited so a 2FA OTP prompt reaches the terminal. */
const claim = (name: string) => {
  const result = spawnSync(
    'pnpm',
    [
      '--filter',
      name,
      'publish',
      '--tag',
      CLAIM_TAG,
      '--access',
      'public',
      '--no-git-checks',
    ],
    { cwd: repoRoot, stdio: 'inherit' }
  )
  if (result.status !== 0) {
    console.error(`Failed to claim ${name}.`)
    process.exit(1)
  }
}

let claimed = 0
const unclaimed: ReturnType<typeof readManifest>[] = []

for (const dir of packageDirs) {
  const manifest = readManifest(dir)
  if (manifest.private) {
    console.log(`private:   ${manifest.name} (never published, skipped)`)
    continue
  }
  if (isClaimed(manifest.name)) {
    claimed += 1
    console.log(`claimed:   ${manifest.name}`)
    continue
  }
  console.log(
    `unclaimed: ${manifest.name} — claiming publishes its current content at ${manifest.version} on dist-tag "${CLAIM_TAG}"`
  )
  unclaimed.push(manifest)
}

console.log(
  `\n${claimed} claimed, ${unclaimed.length} unclaimed of ${packageDirs.length} packages.`
)

if (unclaimed.length === 0 || dry) process.exit(0)

if (!yes) {
  if (!process.stdin.isTTY) {
    console.error(
      'Not a terminal — rerun with --yes to claim the packages above: pnpm claim --yes'
    )
    process.exit(1)
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  console.log(
    `\nAnswering "y" immediately runs \`pnpm publish\` for each unclaimed package as your logged-in npm user: its CURRENT on-disk content goes LIVE on the public registry at its CURRENT version, on dist-tag "${CLAIM_TAG}" (2FA may prompt for an OTP per package).`
  )
  const answer = await rl.question(
    `Claim ${unclaimed.length} package${unclaimed.length === 1 ? '' : 's'} now? [y/N] `
  )
  rl.close()
  if (answer.trim().toLowerCase() !== 'y') {
    console.log('\nNothing claimed. To claim by hand, run:')
    for (const manifest of unclaimed) {
      console.log(`  ${publishCommand(manifest.name)}`)
    }
    console.log('\nOr let the script run those for you: pnpm claim --yes')
    process.exit(0)
  }
}

for (const manifest of unclaimed) {
  console.log(
    `claiming:  ${manifest.name} (${manifest.version}, dist-tag "${CLAIM_TAG}")`
  )
  claim(manifest.name)
}

console.log(`\n${unclaimed.length} newly claimed.`)
