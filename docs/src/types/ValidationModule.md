```ts
/**
 * The validation module instance: validator creation, view-models, owner
 * assembly, store attachment, and the `validateOn` policy. Validators are
 * created per form / model store.
 */
type ValidationModule = ReturnType<
  typeof import('./createValidation').createValidation
>
```
