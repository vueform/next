# Vapor Playground

A **100% Vapor Mode** Vueform playground: the app boots with `createVaporApp`
and every SFC — the app's and (in dev) Vueform's source SFCs — is
vapor-compiled (`features.vapor: true`).

The app imports only the `./vapor` export subpaths:

```ts
import { createVueform } from '@vueform/ui/vapor/origin'
```

In dev, `vfdev` strips the `/vapor` segment and serves the shared
`packages/*/src` source (the vapor/vdom split only exists in the built dist),
so core/ui edits hot-reload here.

## Commands

| Command         | Effect                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`      | Vueform served from source via the vfdev aliases                                                                                                                           |
| `pnpm dev:dist` | `DIST=1` disables vfdev: the `@vueform/*/vapor` imports resolve to the **built vapor dist** through the real exports maps (requires a prior `pnpm build` at the repo root) |

Double-click the page background to toggle dark mode.

## Why this playground is standalone

The workspace pins `vue` to 3.5 via a pnpm override, but Vapor Mode requires
Vue 3.6 (currently `3.6.0-rc.2`). This folder is therefore **excluded from the
pnpm workspace** (see `pnpm-workspace.yaml`) and has its own lockfile and
`node_modules`.

## Setup

```bash
pnpm pg --vapor
```

That's it — the `pg` scripts create `.playgrounds/templates/vapor` from this template,
run the standalone install (`pnpm install --ignore-workspace`), and start the
dev server. `pnpm pg:re --vapor` recreates it from scratch.

A regular workspace install must exist (`pnpm install` at the repo root),
because `@vueform/ui` is symlinked into the monorepo and resolves its own
dependencies there.

`resolve.dedupe` forces a single Vue copy (this playground's 3.6 RC) for both
playground and aliased package code. Expect unmet-peer warnings on install:
the packages declare `vue ^3.5` and the RC prerelease doesn't satisfy that
range. Harmless.

## The vapor dist in one minute

`@vueform/core` and `@vueform/ui` ship a second, vapor-compiled module tree
under `dist/vapor`, mirrored as `./vapor/*` export subpaths. `pnpm build`
(repo root) builds both dists; `pnpm build --vapor` builds just the vapor one.
Vue 3.6 is a **runtime** requirement for `./vapor` consumers only — the
workspace builds it with the `vue-compiler-sfc-vapor` alias while staying on
3.5. Do not mix `.` and `./vapor` entries in one app: both trees re-emit the
same modules, so mixing duplicates module state.

## Tests

The vapor smoke suite lives in `packages/core/tests/vapor` (in-workspace, on
the `vue-vapor` 3.6 npm alias) — run it with `pnpm test:vapor` at the repo
root. This playground is for manual poking only.
