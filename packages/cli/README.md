# @vueform/cli

Command line tools for Vueform. `@vueform/core` depends on this package and
re-exposes its `vf` binary, and every adapter package (`@vueform/ui`,
`@vueform/primevue`) re-exposes it again through core, so projects get the
CLI with the adapter install — no separate install step:

```sh
pnpm vf <command>   # or: npx vf <command>
```

(The bin must come from a direct dependency to land in the project's
`node_modules/.bin` — that's why core and the adapters each carry a one-line
shim, `bin/vf.js`: core's imports `@vueform/cli/bin`, the adapters'
import `@vueform/core/bin`, and each hop crosses only a direct dependency,
so the chain resolves even under pnpm's isolated node_modules.)

## Commands

- `vf copy [component|all]` — copy one Vueform component (or all of them with `all`) into your project for customization; without a name, an interactive multi-select picker
- `vf clone [element] [type]` — create a NEW element from an existing element's blueprint (e.g. a `password` element built on `VfText`); interactive picker + prompt when arguments are omitted
- `vf remove [component...|all]` — remove copied components (files, provenance, barrel — and the registration when nothing is left); without names, a picker over the copies
- `vf view [component]` — inspect a component's registry source before copying it (interactive picker when run without a name)
- `vf register` — register the copies' barrel in your entry file (or explain why it can't)
- `vf list` — list the components available for copying (from the installed package's registry)
- `vf info` — print environment, project, and Vueform package details
- `vf help [command]` — global help, or detailed help for one command (also `<command> --help`)
- `vf --version` — print the CLI version

Common flags on every command: `--cwd <path>`, `--silent`, `-h/--help`. Informational commands (`info`, `list`) support `--json`. Every prompt has a flag equivalent, so all commands can run non-interactively (CI, scripts, agents).

### `copy`

Copies the component's source from the installed package's registry (`registry/`) into your components directory, records provenance in `vueform.config.json`, and regenerates the CLI-owned barrel (`index.ts`) there — the barrel is what a project registers, so registration is a one-time edit no matter how many components get copied. Copied files import everything from the package's public API — they compile as-is, and the app's theme styles them via the same `vf-*` classes.

Run without a name in an interactive terminal, `copy` presents a multi-select picker over the registry (space toggles, `a` toggles all, enter confirms — with nothing toggled, enter copies the highlighted component). The selection goes through the same batch path as `copy all`: one conflict decision for the whole set.

**Settling**: after writing, the new files (copies + barrel) are brought in line with the project's own formatting, so format-on-save won't change them later and trip the modified/conflict checks. With `postCopy` set in `vueform.config.json`, that command runs once per copy run (see Configuration); otherwise the CLI runs the project's **own** prettier over the written files — only when prettier is installed and an explicit project config resolves (no config → nothing happens; factory defaults are never applied), and only ever on the files it just wrote. Provenance hashes are recorded from the settled result, so a file counts as up to date when it matches either the registry source or its settled baseline.

**Registration**: on the very first copy run, if the entry file can be edited safely (exactly one `createVueform(...)` call with an inline object argument, `localComponents` unused — verified via the project's own `typescript` install), the CLI shows the two-line diff and asks to apply it; declining is remembered (`autoRegister: false`). In every other case it prints the manual snippet. `vf register` performs the same safe edit on demand (it ignores `autoRegister: false` — running it _is_ the consent), or tells you why it can't: no copies yet, already registered, or a safety gate failed (with the manual snippet). The barrel spread is inserted _before_ existing `components` entries, so explicit registrations keep precedence.

Flags:

- `--dir <path>` — target directory for this run only (skips prompts, config stays untouched)
- `--yes` — non-interactive: accept the recommended directory
- `--overwrite` — replace an existing copy that differs (otherwise you're asked, or it fails non-interactively)
- `--dry-run` — show what would be written without writing anything

### `clone`

Creates a **new element** based on an existing element's blueprint — `vf clone VfText password` produces `VfPassword.vue` next to your copies, registered under `type: 'password'` for schemas. Run bare, it presents a picker over the registry's **elements** (only components with `element: true` carry a clone template) and then asks for the new element's type (lowercase kebab-case; the component name becomes `Vf<PascalCase>`).

The generated SFC is a ready-to-edit standalone element: the base component's Props/Emits/Slots/Context interfaces are inlined into `<script setup>` under the clone's name (extending the blueprint's types), Parts/Classes/Expose extend the original's, and a plain `<script>` block augments the ControlRegistry + GlobalComponents — so the clone is a first-class element with its own augmentable types. Templates ship pre-verified in the registry (`registry/clones/`); the CLI only substitutes the name and type.

Clones are **your code from the moment they exist**: they're recorded under `clones` in `vueform.config.json` (base, type, provenance) but never diffed or updated against the registry, and `clone` refuses to overwrite an existing file. The barrel picks them up like any copy, so registration works the same way (including the first-run automatic offer). A type that collides with a built-in component (e.g. `text`) is rejected — that's what `copy` is for.

Flags: `--dir <path>` (one-off target, config untouched), `--yes` (accept the recommended directory).

### `remove`

Takes a list of component names (case-insensitive) or `all` — or, run without arguments in an interactive terminal, presents a multi-select picker over the copied components. Removes clones the same way (they're tracked in `clones`). Deletes the copies' files (provenance knows every file, including multi-file components' siblings), drops their provenance entries, and regenerates the barrel — or retires it (and the directory, if now empty) when no copies remain. Files that were modified since copying (or aren't tracked) get **one batch confirmation** before anything is deleted; `--force` skips it — "modified" is judged against the settled baseline hash, so files your own tooling merely reformatted at copy time don't count. After `remove all` (or whenever the last copy goes), if the entry file still contains the automatic registration, the CLI shows the removal diff and asks to clean it up too — `--yes` accepts non-interactively; declining (or a non-interactive run without `--yes`) leaves a note with the manual cleanup.

Flags: `--dir <path>` (override the configured directory), `--yes` (accept the registration removal), `--force` (remove modified copies without asking).

### `view`

Shows a component's pristine registry source without copying it. With no argument in an interactive terminal, it presents an arrow-key picker over the registry. Inside a VS Code terminal the file opens as an editor tab (via the `code` CLI); everywhere else — or if opening fails — the source is printed to the terminal.

## Configuration

The CLI stores its settings in `vueform.config.json` at the project root. This file belongs to the CLI only — it does not hold the Vueform instance config created with `defineConfig`. The `$schema` field points at the schema shipped with this package (resolves locally, no network needed):

```json
{
  "$schema": "./node_modules/@vueform/cli/schema.json",
  "componentsDir": "src/vueform/components",
  "postCopy": "eslint --fix {files}",
  "copies": {
    "VfText": {
      "package": "@vueform/ui",
      "version": "2.0.0",
      "files": {
        "src/vueform/components/VfText.vue": {
          "hash": "sha256:…",
          "registryHash": "sha256:…"
        }
      }
    }
  },
  "clones": {
    "VfPassword": {
      "base": "VfText",
      "type": "password",
      "package": "@vueform/ui",
      "version": "2.0.0",
      "files": {
        "src/vueform/components/VfPassword.vue": { "hash": "sha256:…" }
      }
    }
  }
}
```

`componentsDir` is where copies land. `postCopy` (optional) is a shell command run once after `copy` writes files, from the project root — the place to hook in your own formatting/linting; `{files}` is replaced with the shell-quoted list of written files (copies + barrel), and without the placeholder the command runs as-is. A failing command warns but doesn't undo the copy. `copies` is provenance written by `copy` — the source package, its version, and per file the settled `hash` (the file as it landed, post-formatting — the baseline for modified/conflict checks) plus the pristine `registryHash` (the foundation for future `diff`/`update`). `clones` is written by `clone` — clones are user code, so they carry provenance for bookkeeping but are never updated or diffed. On first `copy` without a config, the CLI recommends a single project-level `vueform` directory — `src/vueform/components` for Vite / src-based projects, `vueform/components` otherwise — and saves the answer. Everything the CLI generates lives under that one `vueform` directory (components today, other generators later).

Prompts require an interactive terminal; set `VUEFORM_CLI_PROMPT=1` to force prompts with piped stdin (e.g. in tests).

## The registry (package side)

Each Vueform adapter ships its own registry in `registry/` at the package root (committed, so files are referenceable on GitHub) (only adapters — `@vueform/core` is an adapter dependency, not a supported direct source of copies) — `index.json` (catalog), `schemas/<Name>.json` (manifests), `copies/` (copy-ready sources with internal imports rewritten to public subpaths; multi-file components like VfForm include their sibling SFCs), and `clones/` (per-element clone templates with `VfCloneName`/`__TYPE__` placeholders, built at generation time from the component's types + SFC). The generator lives in `@vueform/utils` (`generateRegistry`, exposed as the `vf-registry` bin): each adapter runs it via its `registry` script, and `pnpm registry [--<adapter>]` at the monorepo root regenerates all (or the selected) adapters. The format is defined by the JSON Schemas in `packages/core/schemas/` (registry.json for the catalog, registry-item.json for manifests — ajv-validated at generation when the schemas are present, registries ship pure data), and `--check` additionally typechecks every emitted file — clone templates as concrete instantiations (`VfTextClone` / `text-clone`) — against the built package inside the matching playground. Components whose copies wouldn't typecheck in user projects are excluded per target (see `EXCLUDED_COMPONENTS` in `packages/utils/src/registry.ts`). The CLI checks the registry's `schemaVersion` and refuses formats it doesn't understand.

Component descriptions shown to users (`list`, the pickers) come from `src/components.json` — a manually maintained map of adapter short name → component → description, imported statically (so it's emitted into `dist/` by the build) and overlaid onto the loaded registry index. Components it doesn't know fall back to the registry's own (generated) description.

## Adding a command

Create a module in `src/commands/` exporting `{ name, usage, description, valueFlags?, flags?, examples?, run({ positionals, flags, out }) }` and register it in `src/commands/index.ts`. Use `out.log`/`out.fail` for output so `--silent` and the shared error format apply. The package is built with tsc (`src/` → `dist/`); `bin/vf.js` is a stable plain-JS launcher that imports the built `dist/index.js`, so run `pnpm build --cli` after changing sources.
