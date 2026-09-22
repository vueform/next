import { readdirSync } from 'node:fs'

// Scopes mirror workspace packages, derived at lint time so new packages
// are picked up automatically, plus a few repo-level areas.
const packageScopes = readdirSync(new URL('./packages', import.meta.url), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Level 1 = warning: unknown scopes nudge, they don't block.
    'scope-enum': [
      1,
      'always',
      [...packageScopes, 'docs', 'playground', 'deps', 'ci', 'repo'],
    ],
  },
}
