```ts
/**
 * Default `modifiers` context member type — see `BindingMemberOf`. Used as
 * the `TModifiers` default by `BlueprintContext` and the `*Context` builders.
 */
type DefaultContextModifiers<TApi, TSlots> = BindingMemberOf<
  TSlots,
  ApiOf<TApi>,
  'modifiers',
  Modifiers
>
```
