```ts
/**
 * The call signature of one part's override resolver on the `parts` surface:
 * the part member's functional parameters, empty for arg-less parts.
 */
type PartArgsOf<T> = [AspectArgsOf<NonNullable<T>>] extends [never]
  ? []
  : AspectArgsOf<NonNullable<T>>
```
