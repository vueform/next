```ts
/**
 * Plain props type for the auto-complete element blueprint — the widest
 * instantiation of `AutoCompleteProps`. Use this whenever "the props of an
 * auto-complete" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `AutoCompleteApi` type parameters.
 */
type LooseAutoCompleteProps = AutoCompleteProps<
  string,
  SuggestionsProp,
  boolean
>
```
