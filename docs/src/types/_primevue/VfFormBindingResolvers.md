```ts
/**
 * The per-part binding resolvers VfForm hands to its internal sub-components
 * (`FormStep` / `FormNav`): each key resolves the part's bag with the
 * call-site arguments (`bindings.step(page)`), merging the registered
 * definitions and the user's part overrides.
 */
type VfFormBindingResolvers = BindingsOf<VfFormParts, VfFormBindings>
```
