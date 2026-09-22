import { readdirSync, readFileSync } from 'node:fs'

// Scopes mirror workspace packages and their groups, derived at lint time so
// new packages and groups are picked up automatically, plus a few repo-level
// areas. A package joins a group by declaring `"vueform": { "group": "…" }`
// in its package.json (e.g. `adapters`, `plugins`).
const packagesUrl = new URL('./packages', import.meta.url)

const packageScopes = readdirSync(packagesUrl, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

const groupScopes = new Set()

for (const name of packageScopes) {
  try {
    const pkg = JSON.parse(
      readFileSync(new URL(`./packages/${name}/package.json`, import.meta.url))
    )
    if (pkg.vueform?.group) groupScopes.add(pkg.vueform.group)
  } catch {
    // A package without a readable package.json simply has no group.
  }
}

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Level 1 = warning: unknown scopes nudge, they don't block.
    'scope-enum': [
      1,
      'always',
      [
        ...packageScopes,
        ...groupScopes,
        'docs',
        'playground',
        'deps',
        'ci',
        'repo',
      ],
    ],
  },
}
