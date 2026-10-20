```ts
/**
 * The component-level public context carried by the slots' `template` scope.
 * Component slot interfaces always pass their concrete `VfXContext` there, so
 * it is the one place the SFC's own types already reference the
 * Expose-declared binding surfaces (`bindings`). Resolves to `{}` when no
 * template slot is typed.
 */
type SlotContextOf<TSlots> = TSlots extends {
  template: (scope: { context: infer C }) => any
}
  ? C
  : {}
```
