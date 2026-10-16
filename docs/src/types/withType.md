```ts
/**
 * Returns blueprint defaults with the element `type` replaced by the
 * component's own element name (e.g. `'dropdown'`).
 *
 * Blueprint `defaults` bake in the blueprint's canonical type literal (e.g.
 * `'select'`), which a blueprint-reusing component cannot pass to
 * `withDefaults` — its `type` prop expects the component's own literal, at both
 * type level and runtime. The generic parameter keeps the literal inferred, so
 * no `as const` is needed at the call site.
 *
 * @param defaults The blueprint defaults whose `type` to replace.
 * @param type The component's own element type literal.
 */
function withType<TDefaults extends { type: string }, T extends string>(
  defaults: TDefaults,
  type: T
): Omit<TDefaults, 'type'> & { type: T }
```
