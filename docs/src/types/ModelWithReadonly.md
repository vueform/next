```ts
/**
 * Widens array model members (at any depth) to also accept their readonly
 * counterparts. `defineSchema`'s `const` type parameter narrows literal arrays
 * (e.g. `default: [1, 2]` or `default: { row: ['a'] }`) to readonly tuples,
 * which are not assignable to the mutable arrays the element models use —
 * without this, a readonly array default fails `ConstrainEntryModel`'s check,
 * inference falls back to the `(ObjectSchema | ArraySchema) & …` constraint,
 * and the `ArraySchema` member leaks Array prototype keys into `Paths` (i.e.
 * `find()` suggestions).
 *
 * Object branches also become partial: at runtime missing child values fall
 * back to `default` / `nullValue`, so structured `modelValue` / `default` input
 * accepts rows and branches with keys omitted (e.g. keys computed by
 * expressions).
 *
 * Validation-only: never surfaces as a model type, so mapping object members
 * (which structurally widens class instances like `Date`) is safe.
 */
type ModelWithReadonly<M> = M extends readonly (infer E)[]
  ? M | readonly ModelWithReadonly<E>[]
  : M extends (...args: any) => any
    ? M
    : M extends Record<string, any>
      ? { [K in keyof M]?: ModelWithReadonly<M[K]> }
      : M
```
