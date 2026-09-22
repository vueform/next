# Runtime Performance

Growing catalog of internal benches. Each `##` heading is one area
(same idea as `define-schema-500` in types-perf). Rows are git commits;
the Commit column says which run each row is graded against (`X vs Y`).
**Lower is better.**

Rows newer than the `(base)` row all compare to the base; the base row
itself is the ungraded reference, and older rows compare to their own
previous row (their gradings predate the rebase). `pnpm perf:rebase`
promotes the newest row to base.

🟢 / 🔴 only when the change beats the bench’s own noise: for time,
≥ max(10%, sum of the two runs’ error margins) **and** ≥1ms; for heap,
≥5% **and** ≥0.5 MB. Anything smaller is omitted as not reliable.

Time = mean duration. Heap = bytes still alive after forced GC.

- `pnpm bench:perf` → run and record this commit
- `pnpm bench:perf:save` → also snapshot `baseline.json` for before/after
- `pnpm bench:perf:report` → regenerate this file
- `pnpm perf:rebase` → make the newest row the new base

_Last updated: 2026-09-22 07:42:53 UTC_

## Child registry

How expensive it is to track child element instances (`useChildren`) and the form’s full-path descendant index (`elements$`).

| Commit | list reads | mount 300 | heap 300 | heap 1000 | When (UTC) |
| --- | ---: | ---: | ---: | ---: | --- |
| 92c3dcaac vs 92c3dcaac-before | 0.001ms | 851ms | 13.3 MB | 44.6 MB | 2026-08-24 10:30:16 |
| 92c3dcaac-before (base) | 0.001ms | 822ms | 13.1 MB | 45.6 MB | 2026-08-24 10:24:50 |
| bc969fb53 vs 94b720b36 | 0.001ms (🟢 -100.0%) | 379ms | 11.9 MB | 38.6 MB | 2026-08-17 10:58:45 |
| 94b720b36 | 6.48ms | 411ms | 11.9 MB | 39.3 MB | 2026-08-17 10:11:22 |

- **list reads** — Re-read `statefulChildren$`, `availableStatefulChildren$`, and `hoistedChildren$` 50 times on a 500-child `useChildren` registry (no form, no DOM). Measures whether those lists are cached or rebuilt on every access.
- **mount 300** — Mount and immediately unmount a 300-field form (grouped texts, some conditional, some static). Full child registration + unregistration, including the form’s `elements$` descendant index.
- **idle 300** — Retained heap of a mounted 300-field form that is not being read. Every element owns a `useChildren`; this is the per-element registry overhead at rest (`toRef` vs lazy `computed`).
- **idle 1000** — Same as idle 300, with 1000 fields — checks that overhead scales linearly, not worse.

<details>
<summary>Derived lists (no form)</summary>

Standalone `useChildren()` with 500 fake children. No VfForm, no DOM.

| Commit | list reads | list invalidate | register/unregister | When (UTC) |
| --- | ---: | ---: | ---: | --- |
| 92c3dcaac vs 92c3dcaac-before | 0.001ms | 0.110ms | 0.671ms | 2026-08-24 10:30:16 |
| 92c3dcaac-before (base) | 0.001ms | 0.097ms | 0.661ms | 2026-08-24 10:24:50 |
| bc969fb53 vs 94b720b36 | 0.001ms (🟢 -100.0%) | 0.098ms | 0.658ms | 2026-08-17 10:58:45 |
| 94b720b36 | 6.48ms | 0.130ms | 0.653ms | 2026-08-17 10:11:22 |

- **list reads** — Re-read `statefulChildren$`, `availableStatefulChildren$`, and `hoistedChildren$` 50 times on a 500-child `useChildren` registry (no form, no DOM). Measures whether those lists are cached or rebuilt on every access.
- **list invalidate** — Flip one child’s `available`, then read the three lists. Guards that caching does not make the write/invalidate path slower.
- **register/unregister** — Register then unregister 500 paths on an empty registry. Baseline for the identity-guarded set/delete used by `elements$`.

</details>

<details>
<summary>Mounted form</summary>

Real `VfForm`: grouped text fields, `children$` (direct) vs `elements$` (every descendant).

| Commit | mount 100 | mount 300 | cached payload | condition toggle | list add/remove | When (UTC) |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 92c3dcaac vs 92c3dcaac-before | 151ms | 851ms | 0.002ms | 2.93ms | 100ms | 2026-08-24 10:30:16 |
| 92c3dcaac-before (base) | 140ms | 822ms | 0.003ms | 3.01ms | 83.3ms | 2026-08-24 10:24:50 |
| bc969fb53 vs 94b720b36 | 94.3ms | 379ms | 0.002ms | 2.97ms | 19.3ms (🟢 -34.6%) | 2026-08-17 10:58:45 |
| 94b720b36 | 103ms | 411ms | 0.002ms | 3.24ms | 29.4ms | 2026-08-17 10:11:22 |

- **mount 100** — Mount and immediately unmount a 100-field form (grouped texts, some conditional, some static). Full child registration + unregistration, including the form’s `elements$` descendant index.
- **mount 300** — Mount and immediately unmount a 300-field form (grouped texts, some conditional, some static). Full child registration + unregistration, including the form’s `elements$` descendant index.
- **cached payload** — Read `payload` / `invalid` / `empty` / `dirty` / `completed` / `errors` on an already-mounted 300-field form with no model change. These are Vue computeds, so this is the already-cached path — a guard that it stays cheap, not a test of list rebuilds.
- **condition toggle** — Flip a trigger field that hides/shows ~1/3 of a 300-field form, then re-read the aggregates. End-to-end invalidation of availability + payload.
- **list add/remove** — Add then remove one row on an 80-row `VfList`. Registration churn with path re-keying (the identity-guard case).

</details>

<details>
<summary>Retained heap</summary>

What stays alive after GC. “after unmount” should stay ~0; a large % there is usually noise around zero.

| Commit | idle 300 | idle 1000 | after reads 300 | after unmount | When (UTC) |
| --- | ---: | ---: | ---: | ---: | --- |
| 92c3dcaac vs 92c3dcaac-before | 13.3 MB | 44.6 MB | 13.4 MB | ~0 | 2026-08-24 10:30:16 |
| 92c3dcaac-before (base) | 13.1 MB | 45.6 MB | 13.6 MB | ~0 | 2026-08-24 10:24:50 |
| bc969fb53 vs 94b720b36 | 11.9 MB | 38.6 MB | 11.8 MB | ~0 | 2026-08-17 10:58:45 |
| 94b720b36 | 11.9 MB | 39.3 MB | 11.4 MB | ~0 | 2026-08-17 10:11:22 |

- **idle 300** — Retained heap of a mounted 300-field form that is not being read. Every element owns a `useChildren`; this is the per-element registry overhead at rest (`toRef` vs lazy `computed`).
- **idle 1000** — Same as idle 300, with 1000 fields — checks that overhead scales linearly, not worse.
- **after reads 300** — Retained heap after reading the form aggregates once, so hot derived views have instantiated and cached. Extra vs idle is the cost of those cached lists + dependency links.
- **after unmount** — Heap delta after mount + unmount + GC vs the pre-mount baseline. Should stay ~0; a rise means the registry or dep links leaked.

</details>

## Validation staleness

The large-list worst case for store-driven validation staleness: container-level rules run against the full list value, and every write marks affected results stale through the model store.

| Commit | full validate | ruled keystroke | When (UTC) |
| --- | ---: | ---: | --- |
| 92c3dcaac vs 92c3dcaac-before | 0.681ms (🟢 -99.8%) | 1.17ms | 2026-08-24 10:30:16 |
| 92c3dcaac-before (base) | 356ms | 1.15ms | 2026-08-24 10:24:50 |
| bc969fb53 vs 94b720b36 | — | — | 2026-08-17 10:58:45 |
| 94b720b36 | — | — | 2026-08-17 10:11:22 |

- **full validate** — Validate the same list with all 200 rows empty: every row’s `required` rule runs plus the container rules. Guards the synchronous fast path (no per-unit await for sync rules).
- **ruled keystroke** — Update one row’s text with `validateOn: change` on a list that has container rules: the write marks row + container stale, both re-validate, and `validated` re-aggregates. Worst case for store-driven staleness marking.

<details>
<summary>Large list (200 rows)</summary>

A 200-row `VfList` with `min`/`max` container rules and `required` rows, `validateOn: change`.

| Commit | container validate | full validate | ruled keystroke | plain keystroke | When (UTC) |
| --- | ---: | ---: | ---: | ---: | --- |
| 92c3dcaac vs 92c3dcaac-before | 0.048ms | 0.681ms (🟢 -99.8%) | 1.17ms | 0.912ms | 2026-08-24 10:30:16 |
| 92c3dcaac-before (base) | 0.034ms | 356ms | 1.15ms | 0.909ms | 2026-08-24 10:24:50 |
| bc969fb53 vs 94b720b36 | — | — | — | — | 2026-08-17 10:58:45 |
| 94b720b36 | — | — | — | — | 2026-08-17 10:11:22 |

- **container validate** — Validate a 200-row `VfList` whose rows are pre-filled and completed, so only the list’s own rules (`min`/`max`) run. Isolates the container-rule cost plus the staleness bookkeeping around it.
- **full validate** — Validate the same list with all 200 rows empty: every row’s `required` rule runs plus the container rules. Guards the synchronous fast path (no per-unit await for sync rules).
- **ruled keystroke** — Update one row’s text with `validateOn: change` on a list that has container rules: the write marks row + container stale, both re-validate, and `validated` re-aggregates. Worst case for store-driven staleness marking.
- **plain keystroke** — Same keystroke on a list without container rules — leaf-only validation, the contrast baseline for the ruled keystroke.

</details>

