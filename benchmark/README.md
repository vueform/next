# Vueform Benchmark Suite

Real-browser measurements of Vueform production builds. This suite produces every number and chart on the docs' [Performance](../docs/src/guide/performance.md) page: `pnpm bench` writes `results/json/benchmarks.json` and the SVG charts in `results/charts/`, and `pnpm docs:gen -- --benchmark` publishes both into the docs.

## Quick start

```sh
pnpm install        # workspace install
pnpm build          # builds utils → core → adapters (the suite measures dist)
pnpm bench          # full suite: all cases × vdom+vapor × N = 100…1000
pnpm docs:gen -- --benchmark   # publish results to the docs
```

The first run downloads a Chromium build for Playwright if none is cached.

> **Note:** the committed `results/` are placeholders until a real run replaces them — `environment.cpu` says so explicitly. Never publish docs from placeholder data.

## What gets measured, and how

**The app** (`app/`) is a minimal standalone Vue app that mounts a Vueform form built from a parametric schema. It is *not* part of the workspace:

- It consumes **packed tarballs** of the local packages (`pnpm pack` output of `@vueform/ui`, `@vueform/core`, `@vueform/cli` into `app/.tarballs/`), so a run measures exactly what `npm publish` would ship — real `exports` resolution, no symlinks, no source aliases.
- It pins its own **Vue 3.6** (the workspace stays on 3.5). Both rendering modes build from this one Vue copy: the vdom build uses the default compile, the vapor build compiles SFCs with `features.vapor` and resolves Vueform through the `vapor` exports condition. Mode is the only variable.
- Both variants are **production builds** (`vite build`, minified), served from a local static server on loopback. The page loads nothing from the network.

**The harness** (`scripts/`) drives headless Chromium via Playwright:

- Every repetition of every sweep point runs in a **fresh browser context and page** — no repetition inherits another's heap, JIT state, or DOM.
- The page mounts nothing until the harness calls `window.__bench.run()`, so the memory baseline sees an idle page. Heap deltas are taken around the run with **forced GC** (CDP `HeapProfiler.collectGarbage`, twice, settled) and `JSHeapUsedSize` — recorded for the rendering cases only.
- Mount cases time schema → painted DOM (Vue flush + two animation frames). Iterate cases (input, update) run a warmup, then time a batch of operations and divide — one event costs less than the browser's ~0.1 ms timer granularity, so per-event timing would only measure the clock.
- A sweep point's `mean` is the mean over its repetitions (5 for mount cases, 3 for iterate cases, each iterate rep already averaging dozens of in-page iterations).

## Cases

| Case | Measures | Memory |
| --- | --- | --- |
| `render-text` | Mount of a flat form with _N_ text elements | yes |
| `render-steps` | The same _N_ elements across 10 steps of a stepped form | yes |
| `input-text` | One native input event into one of _N_ elements | — |
| `input-text-vmodel` | The same with an active `v-model` on the form | — |
| `update-all` | `form$.update()` replacing all _N_ values at once | — |

Each runs in both modes over _N_ = 100, 250, 500, 750, 1000.

## CLI

```sh
pnpm bench --case=render-text,update-all   # only these cases
pnpm bench --mode=vapor                    # only one rendering mode
pnpm bench --n=100,1000 --reps=3           # narrower sweep, fewer repetitions
pnpm bench --no-pack --no-build            # reuse tarballs and app builds
pnpm bench --warmup=5 --iterations=20      # in-page iteration counts
```

Partial runs **merge** into the existing `results/json/benchmarks.json`, so
one case can be refreshed without rerunning the suite.

## Adding a case

1. `app/src/bench/cases.ts` — the in-page runner: a schema builder plus
   either a timed mount or an `iterate()` operation.
2. `scripts/cases.ts` — the registry entry: id, label, sweep, memory flag,
   repetition counts. The id names the JSON key and the chart files.
3. Reference the new `@bench:<id>...` markers / `<id>-*.svg` charts from a
   docs page if the case should be published.

`scripts/dev-fixture.ts` writes a synthetic full-grid results file (values
modeled on published numbers) for exercising the chart generator and the
docs pipeline without a multi-minute sweep. Never run it over real results.

## Internal regression benches

Separate from this suite: `packages/core/tests/bench/*.bench.ts` are plain [Vitest bench](https://vitest.dev/guide/features.html#benchmarking) files over core's hot paths (mount, model writes, conditions, expressions, validation, pure utils) in happy-dom — seconds to run, local-only, for catching regressions while developing:

```sh
pnpm -F @vueform/core bench                     # run the bench suite

# A/B between refs (same machine, back-to-back):
git checkout main
pnpm -F @vueform/core bench --outputJson bench-main.json
git checkout my-branch
pnpm -F @vueform/core bench --compare bench-main.json
```

Wall-clock microbenchmarks are noisy across machines and CI runners — treat anything under ~10 % as noise unless it reproduces. When CI is set up, [CodSpeed](https://codspeed.io) can run these same files deterministically (instruction counting) per PR: add `@codspeed/vitest-plugin` to the catalog and core's devDependencies, register `codSpeedPlugin()` through `createVitestConfig`'s `vite` option (it no-ops outside the CodSpeed runner), and add a workflow running `pnpm -F @vueform/core bench` under `CodSpeedHQ/action` with a `CODSPEED_TOKEN` secret.
