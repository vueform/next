```ts
/**
 * Base public context for plain form components (e.g. addon, nav). Wraps
 * `BlueprintContext` — blueprint `*Context` interfaces should extend this (or
 * `BaseElementContext`) rather than `BlueprintContext` directly.
 *
 * `TEvents` is always the raw emit map (e.g. `SelectEmits`) and is wrapped with
 * `DefineEvents` eagerly. `DefineEvents` has statically known keys, so
 * blueprint `*Context` interfaces can extend this even while `TProps` /
 * `TEvents` are still type parameters (the conditional `EventsOf` alone would
 * defer and break interface heritage).
 *
 * Kept as a type alias (not an interface) so it can wrap the mapped
 * `BlueprintContext` shape when `TApi` is still a type parameter.
 *
 * `TApi` is typically `typeof setup`.
 */
type BaseComponentContext<
  TApi,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any> = {},
  TSlots extends Record<string, any> = Record<string, any>,
  TParts extends Record<string, any> = Record<string, any>,
  TClasses extends Record<string, any> = Record<string, any>,
  TModifiers = DefaultContextModifiers<TApi, TSlots>,
  TA11y = DefaultContextA11y<TApi, TSlots>,
> = BlueprintContext<
  TApi,
  TProps,
  DefineEvents<TEvents>,
  TSlots,
  TParts,
  TClasses,
  TModifiers,
  TA11y
>
```
