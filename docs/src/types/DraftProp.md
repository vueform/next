```ts
/**
 * Configuration of the form's draft behavior: the model is saved to storage on
 * every action (change and page navigation, regardless of validity), restored
 * on mount, and discarded on successful submit. `true` enables drafts with the
 * defaults (`localStorage` under a key derived from the form's `name`).
 */
type DraftProp = boolean | DraftConfig
```
