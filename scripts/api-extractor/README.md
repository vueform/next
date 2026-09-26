# api-extractor

Extracts structural json representations of core and the adapters — the
source of truth for anything that needs to know what Vueform is made of
(docs generators, tooling, future consumers).

## Usage

```sh
# at the monorepo root
pnpm extract                    # run every scraper for every source
pnpm extract --tokens           # run one (or more) target by flag
pnpm extract --tokens --classes # …combinable, canonical order preserved
pnpm extract --core             # core only
pnpm extract --pv               # one adapter (--ui / --pv / --primevue,
                                # or --adapter=x,y / -a=x,y); merges against
                                # the existing core tree, scraping core first
                                # if missing
pnpm extract:validate           # validate the output (same scope flags)
pnpm extract:issues             # print collected issues (same scope flags)
```

Output goes to `.api/` at the monorepo root (git-ignored), one folder
per source, each holding **every** file:

```
.api/
  core/                  # scraped straight from @vueform/core
  ui/                    # the core-based default adapter
  primevue/
    blueprints.json      # per-element blueprints (props, events)
    classes.json         # .vf-* classes (+ css vars, modifiers)
    components.json      # components (slots, parts, classes…)
    composables.json     # composables (params, returns, docs)
    contexts.json        # contexts
    features.json        # factories (make* from src/features)
    helpers.json         # helpers
    locales.json         # { "<code>": { "key": "<code>" } }
    modules.json         # modules (members, options)
    tokens.json          # design tokens
```

Member nodes keep `type` as a string: object shapes expand under `members`,
and feature options params carry first-class `props` / `deps` / `events`
sections with the declared options type (e.g. `MakeAriaOptions`) in `type`.
`tokens.json` only contains tokens declared in the token groups —
scss-internal css variables are not tokens and are excluded.

An adapter folder's file is core merged with the adapter's own entries — the
adapter wins on conflicts — except `blueprints.json` and `components.json`,
where the adapter's scrape is already a complete curated set (own entries
plus core fallbacks, minus core entries the adapter renames away, e.g.
primevue's `text` → `input-text`) and therefore replaces core wholesale.
Every file has alphabetic root key order.

Everything a scrape found wanting documentation lands in
`.api/issues.json`, keyed by source and always written (empty arrays
when clean) — the data files themselves carry no issue metadata.
`pnpm extract:issues` prints it as an aligned report whose trailing
`file:line` is clickable in editors' terminals; `pnpm extract:validate`
appends the same report after schema and reference checks.

The `features` scraper reads the blueprints output to enrich descriptions,
so `blueprints` must run before it — the orchestrator's order already
guarantees that.

Not scraped yet (no scrapers exist for these): `rules.json`, `styles.json`.

## Schemas

`schemas/` holds one JSON Schema (draft-07) per generated file, describing
its structure — the same schema covers the file in every folder, since
`core/`, `ui/` and `primevue/` share shapes. Definitions shared between
files (`param`, `returns`, `apiMember` and the recursive `member` node of
helpers/composables/features) live in `schemas/common.json`.

`pnpm extract:validate` checks every assembled file against its schema and
resolves every `from` reference against the generated tree, so dangling
references fail loudly; run it after changing a scraper or a schema.

## Layout

- `scrapers/` — one standalone script per output file
- `extract.ts` — the orchestrator behind `pnpm extract`: the shared task-list
  renderer (`scripts/runner.ts`, same as `pnpm build` / `pnpm check`) with one
  progress bar per scraper, an `assemble.ts` task that builds the `core/` +
  adapter folders from the scrapers' raw output (`lib/output.ts`), and a
  closing undocumented-items summary pointing at `.api/issues.json`
- `schemas/` — one JSON Schema per generated file (`pnpm extract:validate`
  checks the output against them)
- `lib/adapters.ts` — which packages are scanned (and per-adapter type renames)
- `lib/extract.ts`, `lib/token-utils.ts` — shared TS-compiler/token plumbing
- `data/` — hand-maintained inputs (e.g. virtual classes)

The docs (`docs/scripts/generators`) consume these jsons and keep their own
docs-specific generators (`keywords`, `types`), which write the same
`core/` / `ui/` / `primevue/` folder layout to `docs/.generated`
(git-ignored as well).
