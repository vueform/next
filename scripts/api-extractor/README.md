# api-extractor

Extracts structural json representations of core and the adapters — the
source of truth for anything that needs to know what Vueform is made of
(docs generators, tooling, future consumers).

## Usage

```sh
# at the monorepo root
pnpm api                     # run every scraper for every source + assemble
pnpm api:missing             # regenerate missing.json from the existing trees
pnpm api:missing --flagged   # …only `@write`-flagged entries
pnpm api:missing --unflagged # …only entries without `@write`
pnpm api:missing --unique    # …each loc once (first occurrence wins)
```

The orchestrator takes no flags — it only guarantees that the jsons are
generated and any error is surfaced (full session log + distilled error log
under `.vueform/api/logs/`). After a successful run it also counts the
missing descriptions across the assembled trees (an empty `description`
value; nodes without the key — like blueprint entries — and inheriting
`{from}` references don't count), writes the report to
`.vueform/api/missing.json` (per target/file, each node's `loc` as a
clickable `file://…#L<line>` link; entries whose docblock carries `@write`
are marked `flagged: true`) and prints a yellow summary line. Validation and issue tracking were removed
pending the extractor rework. A scraper run standalone accepts
`--adapter=x,y` / `-a=x,y` / `-A=x,y` to scope to the listed adapters
(default: core + every adapter).

Output goes to `.vueform/api/` at the monorepo root (git-ignored), one
folder per source, each holding **every** file:

```
.vueform/api/
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

The `features` scraper reads the blueprints output to enrich descriptions,
so `blueprints` must run before it — the orchestrator's order already
guarantees that.

Not scraped yet (no scrapers exist for these): `rules.json`, `styles.json`.

## Schemas

`schemas/` holds one JSON Schema (draft-07) per generated file, describing
its structure — the same schema covers the file in every folder, since
`core/`, `ui/` and `primevue/` share shapes. Definitions shared between
files (`param`, `returns`, `apiMember` and the recursive `member` node of
helpers/composables/features) live in `schemas/common.json`. Nothing
validates against them right now — the validator went with the removed
validation flow and returns with the extractor rework.

## Layout

- `scrapers/` — one standalone script per output file
- `../api.ts` — the orchestrator behind `pnpm api`: the live per-task
  display of the root test runner (one row per scraper, session logs under
  `.vueform/api/logs/`), closing with an `assemble.ts` task that builds the
  `core/` + adapter folders from the scrapers' raw output (`lib/output.ts`)
- `schemas/` — one JSON Schema per generated file (reference only for now)
- `lib/adapters.ts` — which packages are scanned (and per-adapter type renames)
- `lib/extract.ts` — shared TS-compiler plumbing
- `data/` — hand-maintained inputs (e.g. virtual classes)

The docs (`docs/scripts/generators`) consume these jsons and keep their own
docs-specific generators (`keywords`, `types`), which write the same
`core/` / `ui/` / `primevue/` folder layout to `docs/.generated`
(git-ignored as well).
