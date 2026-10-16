```ts
/**
 * The non-generic slice of the `useData` return shared by every default
 * `makeData` instantiation (model fields and conditional groups excluded).
 *
 * Hoisted to a module-level alias — unlike the generic-parameter `Base` of the
 * previous `MakeDataReturn<P, Base>` shape — so the heavy `Omit` over
 * `UseDataReturn` is computed and cached once instead of being re-derived per
 * prop instantiation. Only the small `MakeDataModelApi<P>` slice varies with
 * `P` (same structure `MakeItemsReturn<P>` uses).
 */
type MakeDataBase = Omit<
  UseDataReturn,
  UseDataRepeatableKeys | UseDataTranslatableKeys | keyof MakeDataModelApi
>
```
