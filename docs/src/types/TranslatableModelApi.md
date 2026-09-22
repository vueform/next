```ts
/**
 * Blueprint API overlay for elements that use `makeTData`. Same caching as
 * `ModelApi`, with the translatable model slice (`model` required per language,
 * `value` typed by the blueprint-supplied `TValue` — see
 * `MakeDataModelApiTranslatable`).
 */
type TranslatableModelApi<Base, P, TValue = any> = Omit<
  Base,
  keyof MakeDataModelApiTranslatable
> &
  MakeDataModelApiTranslatable<P, TValue>
```
