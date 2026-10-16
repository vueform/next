```ts
/**
 * Re-narrows item/group key props from the registry props instantiated with the
 * schema entry. Invalid keys (`itemValue: 'idf'` / `optionValue: 'idf'` against
 * `{ id, name }` items) and key props on synthetic shapes (scalar arrays,
 * record maps) fail the same way a wrong `modelValue` does.
 */
type ConstrainEntryItemKeys<El, P> = [
  Extract<keyof P, ItemKeyPropNames>,
] extends [never]
  ? El
  : El extends Pick<P, Extract<keyof El, ItemKeyPropNames> & keyof P>
    ? El
    : Omit<El, ItemKeyPropNames> &
        Pick<P, Extract<keyof El, ItemKeyPropNames> & keyof P>
```
