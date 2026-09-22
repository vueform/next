````ts
/**
 * Returns the full public context of a registered component — the
 * `defineExpose` shape from `useBlueprint`, plus `$config`, `$locale`, and
 * `$globals` injected by `createComponentContext` on every component.
 *
 * Pass a props payload as `TEntry` to narrow prop-generic components the same
 * way SFC generics do:
 *
 * ```ts
 * ContextOf<'VfSelect', { items: typeof items; itemValue: 'id' }>
 * ```
 */
type ContextOf<
  T extends ComponentNames,
  TEntry = Record<string, any>,
> = ComponentRegistry<TEntry>[T]['context']
````
