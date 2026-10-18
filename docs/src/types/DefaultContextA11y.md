```ts
/**
 * Default `a11yBindings` context member type — see `BindingMemberOf`. Used
 * as the `TA11y` default by `BlueprintContext` and the `*Context` builders.
 */
type DefaultContextA11y<TApi, TSlots> = BindingMemberOf<
  TSlots,
  ApiOf<TApi>,
  'a11yBindings',
  A11yBindings
>
```
