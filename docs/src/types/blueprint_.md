```ts
/**
 * Builds the addon factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
function blueprint<TProps extends AddonProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<AddonEmits>
): {
  /**
   * Resolves the addon prop into a sanitized text string or a dynamic component
   * descriptor (`{ component, props }`) for rendering.
   */
  resolved: ComputedRef<ResolvedAddon>
}
```
