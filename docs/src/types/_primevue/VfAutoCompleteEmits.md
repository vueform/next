```ts
/**
 * Events emitted by the VfAutoComplete component, parameterized by the
 * suggestion-driving type arguments so event handlers (e.g. `@change`) receive
 * the narrowed context — same pattern as `VfAutoCompleteSlots`. Plain usage
 * (`VfAutoCompleteEmits`) keeps the context wide.
 */
interface VfAutoCompleteEmits<
  TSuggestions extends SuggestionsProp = SuggestionsProp,
  TMultiple extends boolean = false,
  TModel = any,
> extends AutoCompleteEmits<
  VfAutoCompleteContext<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>
> {}
```
