# TypeScript Performance

Cold `vue-tsc --extendedDiagnostics` measurements. Results are keyed by
`measurement → commit` in `results.json`.

Memory is post-GC live heap (vue-tsc runs with `--expose-gc`). Rows
before 2026-08-31 were measured without it and are noisier / not directly
comparable.

- `pnpm tsc:perf` → run every `benchmarks/types/*.ts` fixture
- `pnpm tsc:perf -- <measurement>` → run a specific fixture
- `pnpm tsc:perf -- report` → regenerate this file

_Last updated: 2026-09-23 14:57:41 UTC_

## define-schema-500

| Commit | Total | Memory | When (UTC) |
| --- | ---: | ---: | --- |
| dd6874302 | 4.09s (🟡 -1.2%) | 712.7 MB (🟡 +4.8%) | 2026-08-18 09:31:40 |
| 516f989dd | 4.14s (🟡 -0.7%) | 679.7 MB (🟡 -4.2%) | 2026-08-18 05:29:41 |
| 53f117516 | 4.17s (🟡 -4.6%) | 709.5 MB (🟡 -0.6%) | 2026-08-18 05:16:08 |
| 55ef54659 | 4.37s (🟡 +4.0%) | 714.0 MB (🟡 -0.4%) | 2026-08-18 04:46:13 |
| efaa3ee8b | 4.20s (🟡 -0.5%) | 716.6 MB (🟡 +1.7%) | 2026-08-12 04:34:38 |
| e3467137c | 4.22s (🟡 +2.2%) | 704.4 MB (🟡 -3.8%) | 2026-08-12 04:14:28 |
| 0a9e3ff05 | 4.13s (🟡 -4.8%) | 732.3 MB (🟡 +2.7%) | 2026-08-12 03:59:09 |
| 57af5a76f | 4.34s (🟡 +2.6%) | 713.2 MB (🟡 +1.7%) | 2026-08-11 16:07:18 |
| 306ae129f | 4.23s (🟡 -4.1%) | 701.5 MB (🟡 +0.3%) | 2026-08-11 15:23:41 |
| c3e8a5ab4 | 4.41s (🟡 +0.7%) | 699.1 MB (🟡 +1.3%) | 2026-08-11 11:15:57 |
| 2abcdc2f5 | 4.38s (🟡 +4.0%) | 690.0 MB (🟡 -1.1%) | 2026-08-11 10:52:47 |
| f9d60113e | 4.21s (🟡 +4.5%) | 697.8 MB (🟡 -0.5%) | 2026-08-11 10:44:37 |
| 097de985c | 4.03s (🟡 -3.8%) | 701.3 MB (🟡 +2.4%) | 2026-08-11 09:13:02 |
| dbd79f312 | 4.19s | 685.0 MB | 2026-08-11 09:10:28 |
