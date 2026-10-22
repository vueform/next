```ts
/**
 * Configuration of the form's draft behavior: the model is saved to storage on
 * the configured `on` events (debounced change saves by default, regardless of
 * validity), restored on mount, and discarded on successful submit. `true`
 * enables drafts with the defaults (`localStorage` under a key derived from
 * the form's `name`).
 */
type DraftProp = boolean | DraftConfig
```
