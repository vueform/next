# Metrics

Public-facing numbers behind the current Vueform version: rendering
performance benchmarks and bundle sizes, regenerated whenever the core
package, an adapter or a plugin is released.

Everything committed lives under [results/](results/):

- [BENCHMARKS.md](results/BENCHMARKS.md) — per-case tables and SVG charts
  ([results/charts/](results/charts/))
- [UI.md](results/UI.md) / [PRIMEVUE.md](results/PRIMEVUE.md) /
  [PLUGINS.md](results/PLUGINS.md) — bundle-size reports
- [results/json/](results/json/) — the raw measurement data every report and
  chart is generated from

## Benchmarks

Parametric performance benchmarks. Each case renders a form with an
increasing number of elements (the N sweep: 100, 250, 500, 750, 1000) in a
real browser (Playwright + Chromium, production mode), comparing **vdom** and
**vapor** rendering modes on the same Vue 3.6 runtime.

```bash
pnpm bench                       # all cases, both modes, full sweep + charts + report
pnpm bench --vapor               # vapor mode only
pnpm bench --vdom                # vdom mode only
pnpm bench --case=render-text,input-text   # only the listed cases
pnpm bench --n=100,500           # limit the sweep values
pnpm bench --runs=5              # override runs per sweep point
pnpm bench --dry --runs=3        # quick sanity check — terminal output only, nothing saved
pnpm bench:charts                # regenerate results/charts/*.svg from benchmarks.json
pnpm bench:report                # regenerate results/BENCHMARKS.md from benchmarks.json
```

Partial runs (mode/case/n filters) merge into
`results/json/benchmarks.json`; charts and the report are always regenerated
from the full file.

Each sweep point runs in its own vitest process, i.e. a fresh browser page.
Memory retained across mounts would otherwise accumulate over a whole sweep
and skew later points (or crash the page). `--no-isolate` runs a mode in a
single page instead — faster to start, only sensible for quick checks.

The browser runs headless, so the many per-point launches don't steal focus.
Set `BENCH_HEADED=1` to watch a run. Don't compare headless and headed
numbers with each other — compositing differs slightly.

### Structure

- `bench/cases/` — case definitions. A case declares its `ns` sweep and a
  timed `run({ mount, n })` body. See [bench/case.ts](bench/case.ts) for the
  API.
- `bench/mount.ts` — mounts VfForm from the `@vueform/ui` dist. In vapor mode
  the vitest config aliases every `@vueform/ui/...` import to its
  `@vueform/ui/vapor/...` twin, so the same module serves both modes.
- `bench/BenchRoot.vue` — the wrapper root compiled per-mode by the vapor SFC
  compiler; binds reactive props to VfForm and captures `form$`.
- `bench/run.test.ts` — generic runner iterating cases × sweep values.
- `bench/helpers.ts` — the `bench()` measurement loop (timing stats + heap).
- `bench/scripts/run.ts` — CLI orchestrating vdom + vapor vitest runs.
- `bench/scripts/charts.ts` / `report.ts` — SVG + BENCHMARKS.md generation.

To add a case, create a file in `bench/cases/` with `defineCase({ ... })` and
register it in `bench/cases/index.ts`. Sweep values (`ns`), run counts
(`runs`, `warmup`) and heap measurement (`memory`) are configurable per case.

## Bundle sizes

Measures the bundle impact of Vueform piece by piece in a fully built Vite
app: the core baseline, then what each module, rule, locale, theme, component
and plugin adds on top. For every scenario the harness generates a
`src/main.ts` into the minimal fixture app in `size/fixtures/<suite>/`, runs
a production Vite build against the packages' built `dist` artifacts, and
records the raw / gzip / brotli sizes of all emitted JS and CSS assets.

Build the packages first, then run from the monorepo root:

```bash
pnpm build
pnpm size                        # all suites: core, ui, primevue, plugins
pnpm size --core                 # building blocks (modules, rules, locales) — adapter-independent
pnpm size --ui                   # @vueform/ui
pnpm size --primevue             # @vueform/primevue
pnpm size --plugins              # @vueform/dompurify, @vueform/expr-eval, ...
pnpm size:report                 # regenerate all md reports from existing json
```

Each suite writes `results/json/<suite>.json`; every run regenerates all md
reports. The `core` suite has no report of its own — its numbers are embedded
into UI.md and PRIMEVUE.md.

Reported sizes count JS assets only, except in scenarios that register the
theme module, where CSS counts too — without the theme module the CSS is not
functional, so it is not part of a scenario's meaningful cost.

### Flags

```bash
pnpm size --list                 # list all scenarios of the selected suites
pnpm size --ui --only VfText     # run a subset (runs all-minus-VfText and its bases)
pnpm size --stats                # also emit rollup-plugin-visualizer HTML under .stats/
```

Partial runs (`--only`) merge into the existing json instead of discarding
previous scenarios.

### Dependency hygiene

Every fixture build runs a duplicate guard: if the same package is bundled
from two different pnpm instances (e.g. `primevue` keyed against two vue
versions after a partial dependency update), the run fails and names the
duplicates — bundled duplicates silently inflate every scenario that pulls
the package in. To update dependencies, use `pnpm bump` at the monorepo root
(`pnpm -r update && pnpm dedupe`): it updates the whole workspace at once and
dedupes, so version skew between the fixtures and the workspace packages
cannot arise. After a bump, re-run the suites — dependency versions are part
of the measurement (see the report's "Measured with" list).
