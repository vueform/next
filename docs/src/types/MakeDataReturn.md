```ts
/**
 * Prop-dependent return type of `makeData`. Model fields and mutators follow
 * `P['modelValue']` via `MakeDataModelApi`; everything else comes from the
 * cached non-generic base.
 */
type MakeDataReturn<P = MakeDataOptions['props']> = MakeDataBase &
  MakeDataModelApi<P>
```
