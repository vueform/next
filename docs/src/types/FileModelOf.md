```ts
/**
 * File element model shaped by `multiple`:
 *
 * - `multiple: false` — `File | null`
 * - `multiple: true` — `File[]`
 * - `multiple` unset / wide `boolean` — `File | File[] | null`
 */
type FileModelOf<TMultiple extends boolean = boolean> = [boolean] extends [
  TMultiple,
]
  ? File | File[] | null
  : [TMultiple] extends [true]
    ? File[]
    : File | null
```
