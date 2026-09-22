# Contributing

## Commit messages

This repo follows [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint via a husky `commit-msg` hook.

```
<type>(<scope>): <subject>

<optional body>

<optional footer>
```

Example:

```
fix(core): prevent Vue reactive proxies from poisoning Zod's ~standard cache

Zod 4 resolves `~standard` via a lazy getter that caches `this`-bound
props. Reading it through a reactive proxy cached proxy-bound internals,
which throw because `_zod` is non-configurable.
```

### Types

| Type       | Use for                                        |
| ---------- | ---------------------------------------------- |
| `feat`     | new user-facing capability                     |
| `fix`      | bug fix                                        |
| `refactor` | code change that is neither a feature nor fix  |
| `perf`     | performance improvement                        |
| `test`     | adding or fixing tests                         |
| `docs`     | documentation only                             |
| `build`    | build system, bundling, dependencies           |
| `ci`       | CI configuration                               |
| `chore`    | maintenance that fits nothing above            |

Breaking changes: append `!` after the type/scope (`feat(core)!: …`) or add a `BREAKING CHANGE:` footer.

### Scopes

Scopes mirror workspace packages — the directory names under `packages/` (e.g. `core`, `ui`, `primevue`) — plus `docs`, `playground`, `deps`, `ci`, and `repo` for repo-level work. The list is derived from `packages/` automatically at lint time (see `commitlint.config.mjs`), so new packages need no config change. Omit the scope when a change genuinely spans everything. Unknown scopes produce a warning, not an error.

### Subject rules

- Imperative mood: "add validation", not "added" or "adds". The subject should complete the sentence "if applied, this commit will …".
- Lowercase after the colon, no trailing period.
- Keep it under 72 characters.
- Say **what** and **why** — the diff already shows the how. Put the why (root cause, constraint, rejected alternative) in the body.

### One commit, one logical change

Don't mix a refactor with a fix in the same commit. Small, atomic commits with accurate messages are worth more than perfectly formatted big ones — they keep review and `git bisect` useful.
