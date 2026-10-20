```ts
/**
 * A part-keyed bindings definition registered via `useBindings`: for each
 * part key, one entry. Entries for the same key across definitions
 * resolve-then-shallow-merge in registration order. Deliberately NO
 * whole-surface factories — entries close over the component scope (or
 * receive the api through their pattern, e.g. `useBindings(inputAria(api))`),
 * so registering a definition performs no reactive reads.
 */
type BindingDefs = Record<string, BindingEntry>
```
