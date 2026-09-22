```ts
/**
 * Builds the standard outlets map every Vueform component exposes as
 * `context.outlets`: inline Vue template slots merged with normalized
 * prop-based slot overrides, plus the component template resolved into
 * `outlets.template`.
 *
 * Inline slots are included as-is (wrapped into VDOM-renderable slot functions
 * on vapor, where compiled slots return DOM blocks that VDOM consumers like
 * `<component :is>` can't render). Kebab-case slot names are normalized to
 * camelCase. Inline slots take priority over prop-based ones — the same order
 * the components' render pattern produces (`<slot name="x">` renders the inline
 * content and only falls back to the prop-based outlet), so `outlets.x` always
 * holds what actually renders.
 *
 * Slot overrides are normalized: a string entry listed in
 * `$security.allowComponents` is passed through for Vue to resolve as that
 * component; every other string is content — plain text renders escaped, and
 * HTML renders only through `$security.allowHtml` with the sanitizer applied
 * after expression resolution; object components are unwrapped via `toRaw` and
 * marked raw (so schemas held in refs or stores work without user-side
 * `markRaw`), and ones without an explicit `inheritAttrs: true` are patched to
 * `false` — through a per-original cache so the patched copy keeps its identity
 * across re-evaluations.
 *
 * Template resolution order (mirroring the documented component resolution):
 * inline `#template` slot, then the `template` prop (which config `defaults`
 * and presets feed like any other prop), then `slots.template`. A string
 * `template` prop goes through the same component allowlist.
 *
 * Called by `useBlueprint` for every component; blueprints only call it
 * directly to post-process the result (e.g. the layout blueprint resolving the
 * element's `layout` prop into `template`).
 *
 * @param options Outlet resolution options.
 */
function useOutlets(options: UseOutletsOptions): UseOutletsReturn
```
