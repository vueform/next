# Source-location (`loc`) inventory

> **Decision & status (2026-10-09):** implemented as `loc: "<repo-relative
> path>:<line>"` on **every description-bearing node** (empty descriptions
> included — they are the future validator's targets), via the shared
> `loc()` helper in `lib/extract.ts`. tokens.json/classes.json's old
> `file`+`line` were unified into `loc` (docs generators updated). `{from}`
> references carry nothing — the origin entry's `loc` is the location. The
> only nodes without `loc` are the synthesized defineEvents `on`/`off`
> members and their `e`/`callback` params (no source construct; the parent
> overload's `loc` is the anchor). Nodes without a description (defaults,
> `element`, `features[]`, `returns {type}`) remain untouched — the table
> below is kept as the reference for extending coverage later.

Where a `source: "<repo-relative path>:<line>"` field could be attached to
the nodes of the generated `.vueform/api/` jsons, per emission site. Status
is grounded in the current extractors (function + line anchors verified
2026-10-09).

**Status legend**

| Status | Meaning |
| --- | --- |
| ✓ free | A positioned `ts.Node`/declaration is in scope at the construction site — just emit the field |
| ◐ lookup | One `symbol.getDeclarations()?.[0]` fetch away |
| ◔ plumb | The node/offset exists but must be threaded through intermediate structs (or offset→line mapped) |
| → origin | A `from` reference — the honest location belongs to the referenced entry; follow the reference instead of storing one |
| ★ done | Already emits `file` + `line` today |
| – anchor | No source construct of its own (synthesized) — fall back to the parent/owner's location |

## The table

| # | File | JSON path | Source of truth | Status | Note |
| --- | --- | --- | --- | --- | --- |
| 1 | blueprints | `<bp>` | blueprint file / `useBlueprint` statement (bp.ts:985) | ✓ free | |
| 2 | blueprints | `<bp>.props.<p>` | `PropertySignature` of `<N>Props` (bp.ts:288) | ✓ free | decl may live in core — correct provenance for free |
| 3 | blueprints | `<bp>.props.<p>.default` | `defaults` object-literal property (bp.ts:376) | ◔ plumb | thread pos through `DefaultEntry`; synthesized boolean `false` → anchor on prop |
| 4 | blueprints | `<bp>.props.<p>.params.<x>` | fn-type param symbols + `@param` JSDoc (bp.ts:191) | ◐ lookup | |
| 5 | blueprints | `<bp>.props.<p>.returns` | checker type only (bp.ts:213) | – anchor | prop decl |
| 6 | blueprints | `<bp>.events.<e>` | property symbol of `<N>Emits` (bp.ts:335) | ◐ lookup | |
| 7 | blueprints | `<bp>.events.<e>.params.<x>` | named tuple member (bp.ts:246) / JSDoc-only (bp.ts:261) | ✓ free / – anchor | |
| 8 | blueprints | `<bp>.features[i]` | `.use(X)` call-site identifier (bp.ts:504) | ✓ free | call site; factory *definition* would need checker resolution |
| 9 | blueprints | `<bp>.api.<m>` | spread-origin / shorthand-origin / property assignment (bp.ts:655/691/712) | ✓ free | |
| 10 | components | `<C>` | types.ts Props interface (comp.ts:224/493) | ✓ free | |
| 11 | components | `<C>.blueprint` | import-specifier literal in api.ts/index.ts (extract.ts:558) | ✓ free | |
| 12 | components | `<C>.element` | regex over `.vue` template (comp.ts:68) | ◔ plumb | offset→line counting, or file-only |
| 13 | components | `<C>.props.<p>` | `PropertySignature` (extract.ts:606) | ✓ free | same decl `classifyPropSources` already inspects; may point into node_modules |
| 14 | components | `<C>.props.<p>.default` | blueprint `defaults` literal (extract.ts:449) | ◔ plumb | same plumbing as #3 |
| 15 | components | `<C>.events.<e>` (+params) | property symbol; tuple labels / JSDoc-only (extract.ts:849/355) | ✓ free | fallback: owning interface decl for forwarded/synthetic events |
| 16 | components | `<C>.parts.<p>` | `PropertySignature` of `<C>Parts` (extract.ts:874) | ✓ free | |
| 17 | components | `<C>.slots.<s>` (+slot params) | `PropertySignature` / context-type member (extract.ts:943/969) | ✓ free | `expandSlotInheritance` clones JSON → embedded locations propagate correctly |
| 18 | components | `<C>.classes.<c>` (type/desc/params) | `PropertySignature` of `<C>Classes` (extract.ts:1061) | ✓ free | |
| 19 | components | `<C>.classes.<c>.default` | synthetic SFC-script parse of `<C>.vue` + `VfLayout.vue` (extract.ts:1363/1310) | ◔ plumb | hardest spot: fake `'script.ts'` SourceFile needs vue path + script-block offset; merged defaults have **two** sources |
| 20 | components | `<C>.api.<m>` | shorthand origin / property assignment in api.ts (extract.ts:1623/1645) | ✓ free | |
| 21 | components | `<C>.adapterFeatures[i]` | `.use()` identifiers in api.ts (extract.ts:1852) | ✓ free | call site |
| 22 | components | `<C>.adapterTypeInfo.*` | heritage `Omit<>` type nodes / adapter-lib d.ts (extract.ts:759/785) | ✓ free | overwritten/unavailable props point into node_modules |
| 23 | composables | `<useX>` | `FunctionDeclaration` (composables.ts:1340) | ✓ free | |
| 24 | composables | `<useX>.params.<p>` (+expanded members) | `ParameterDeclaration` / `PropertySignature` (composables.ts:1360/394) | ✓ free | |
| 25 | composables | `<useX>.returns` `{type}` | checker type (composables.ts:1234) | – anchor | fn decl |
| 26 | composables | `<useX>.returns` `{from}` | referenced context/composable (composables.ts:1261) | → origin | origin decl reachable via aliased symbol in `importedCalleeName` (lib/extract.ts:225) if wanted |
| 27 | composables | `<useX>.returns.type.<m>` concrete | local decl / property assignment (composables.ts:922/977) | ✓ free | |
| 28 | composables | `<useX>.returns.type.<m>` `{from}` | referenced origin (composables.ts:888/871) | → origin | |
| 29 | composables | defineEvents members (`fire`/`on`/`off`…) | event-map `PropertySignature` (composables.ts:689) | ◔ plumb | carry pos via `EventMapEntry`; synthetic `e`/`callback` params: – anchor |
| 30 | composables | `<useX>.overloads[]` | overload/sig/tuple decls (composables.ts:447/1105) | ✓ free | |
| 31 | composables | nested fn-member params | param symbols (composables.ts:502) | ◐ lookup | |
| 32 | helpers | entry / params / overloads / concrete return members | same shapes as composables (helpers.ts:1031/1095/901/606) | ✓ free | |
| 33 | helpers | `returns` `{type}` / `{from}` | checker / referenced origin (helpers.ts:913) | – anchor / → origin | |
| 34 | features | `<makeX>` (incl. defineFeature + aliases) | fn / variable decl (features.ts:1492/1566) | ✓ free | alias copies inherit target's member locations — correct |
| 35 | features | `config.<m>` | `propDecl` (features.ts:1752) | ✓ free | ex-`markUndocumented` site |
| 36 | features | `props.<p>` | `propDecl` of options type (features.ts:450) | ✓ free | ex-site; generic instantiation points at defining type — correct |
| 37 | features | `deps.<d>` concrete | `propDecl` (features.ts:599) | ✓ free | ex-site |
| 38 | features | `deps.<d>` `{from}` (ReturnsOf / resolveDepOrigins) | referenced factory's return (features.ts:604/1721) | → origin | `resolveDepOrigins` is JSON-level — no nodes; post-hoc lookup via the `from` path only |
| 39 | features | `events.<e>` (+params) | `fire` overload sig decl; tuple labels (features.ts:674/686) | ✓ free / ◐ lookup | ex-site |
| 40 | features | `returns.<m>` concrete | localDecl / prop assignment / spreadDecl (features.ts:1109/1147/993) | ✓ free | ex-sites |
| 41 | features | `returns.<m>` `{from}` (spread / delegation) | origin member decl via `prop.getDeclarations()` (features.ts:849/965) | ◐ lookup | the fetched decl IS the origin — ideal direct anchor |
| 42 | features | blueprint-inherited descriptions | blueprints.json enrichment (features.ts:1241) | → origin | provenance needs blueprints' own `source` first |
| 43 | modules | `<mod>` | module interface/type decl (modules.ts:331) | ✓ free | |
| 44 | modules | `api.<m>` / `call` | property decl / call-sig decl (modules.ts:241/210) | ✓ free | |
| 45 | modules | `api.<m>.params.<p>` | param symbols (modules.ts:168) | ◐ lookup | |
| 46 | contexts | `<ctx>` (+`returns`) | synthesized from create/use `FunctionEntry` pair (contexts.ts:428) | ◔ plumb | carry pos through `FunctionEntry` into the synthesis |
| 47 | contexts | `params.<p>` (+expanded), `overloads` | `ParameterDeclaration` / propDecl / sigDecl (contexts.ts:275/206/153) | ✓ free | |
| 48 | tokens | token entry | regex line-walk of `tokens/index.ts` (tokens.ts:138/205) | ★ done | caveat: multiline values can point at the value's last line, not the key |
| 49 | tokens | `dark` overrides | `parseDarkOverrides` (tokens.ts:468) | ◔ plumb | minor; today a dark-only adapter override keeps the *core* file/line |
| 50 | locales | `<code>` | docblock at top of `<code>.ts` (locales.ts:69) | ✓ free | synthesize `packages/core/src/locales/<code>.ts:1` |
| 51 | classes | class entry / modifiers | scss docblock scan (classes.ts:343/422) | ★ done | |
| 52 | classes | `tokens[]` references | `var(--vf-*)` usages over comment-stripped text (classes.ts:179) | → origin | canonical location lives in tokens.json; per-usage positions not worth the churn |
| 53 | classes | virtual classes | `data/virtual-classes.json` (classes.ts:486) | – anchor | the data file is the only honest source |

## Cross-cutting facts

- **Format**: one string key, repo-relative `path:line` (editor-clickable);
  `@` works too but `:` is what terminals/IDEs linkify.
- **Merges preserve it for free**: every assemble/copy layer
  (`deepMergeBlueprints`, re-export `structuredClone`s, slot-inheritance
  expansion, root-level adapter spread, `normalizeMemberNode`,
  `stripSymbolKeys`, `sortRoot`) passes unknown keys through verbatim —
  embed `source` at extraction time and copied entries automatically keep
  the semantically correct (core vs adapter) location. A `__@`-prefixed key
  is the one thing `stripSymbolKeys` drops — usable for extraction-only
  metadata that should NOT reach the output.
- **`from` references** (→ origin rows): recommend storing nothing — the
  `from` path already identifies the origin entry, whose own `source`
  becomes the location. Only `resolveDepOrigins` (#38) has no node access
  at all, so this policy is also the only possible one there.
- **Schemas**: each restored schema in `schemas/` would gain an optional
  `source` string property (shared def in `common.json`).
