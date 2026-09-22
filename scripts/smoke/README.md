# Pre-release e2e smoke

`pnpm smoke:e2e` (or `node scripts/smoke-e2e.mjs --ui` / `--primevue`)

For each adapter, scaffolds a throwaway app in `.smoke-tmp/` (never touches
`playground/` or `.playgrounds/` — those hold real user code), symlinks the
workspace packages, runs the real CLI (`vueform copy all --dir src/vueform`),
injects a `data-local-copy` marker into one copy, then boots vite and asserts
in headless Chromium that:

- the marked LOCAL copy renders (the barrel-registered copy overrides the
  built-in component),
- typing flows into the form v-model,
- the page produced no console/page errors.

Exit code is nonzero on any failure — suitable as a release gate.

The app templates live next to this file; their tsconfig `paths` mirror the
playgrounds' source mappings because `@vue/compiler-sfc`'s type resolution
follows them (vite-level aliases alone don't reach it).
