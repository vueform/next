```ts
/**
 * The shape of a single component registration in the `*Registry` interfaces.
 *
 * `TContext` is the full public context — exactly what `defineExpose` receives
 * from `useBlueprint` (factory API + event helpers + `props` / `parts` /
 * `classes` / `outlets`). `TProps` / `TEmits` are instantiated from the
 * registry's `TEntry` payload for prop-generic components; `TSlots` / `TParts`
 * / `TClasses` stay wide (narrowed slots already flow through `TProps`).
 */
type DefineRegistryEntry<
  TProps extends Record<string, any>,
  TEmits extends Record<string, any>,
  TSlots extends Record<string, any>,
  TParts extends Record<string, any>,
  TClasses extends Record<string, any>,
  TContext,
> = {
  /**
   * The component's prop types, narrowed by the registry `TEntry` payload for
   * prop-generic components.
   */
  props: TProps

  /**
   * The component's emit map, narrowed by the registry `TEntry` payload so
   * schema `on*` handlers receive the narrowed context.
   */
  emits: TEmits

  /**
   * The component's slot definitions (wide).
   */
  slots: TSlots

  /**
   * The component's template part definitions (wide).
   */
  parts: TParts

  /**
   * The component's CSS class definitions (wide).
   */
  classes: TClasses

  /**
   * The component's full public context — the `defineExpose` shape, narrowed by
   * the registry `TEntry` payload for prop-generic components.
   */
  context: TContext
}
```
