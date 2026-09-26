```ts
/**
 * File element model shaped by `multiple`:
 *
 * Values are `FileProp` (File instance, URL/filename string, or a FileObject
 * for pre-existing uploads) — the same contract the runtime normalizes.
 *
 * - `multiple: false` — `FileProp | null`
 * - `multiple: true` — `FileProp[]`
 * - `multiple` unset / wide `boolean` — `FileProp | FileProp[] | null`
 */
type FileModelOf<TMultiple extends boolean = boolean> = [boolean] extends [
  TMultiple,
]
  ? FileProp | FileProp[] | null
  : [TMultiple] extends [true]
    ? FileProp[]
    : FileProp | null
```
