```ts
/**
 * Generic props interface for the VfAutoComplete component, parameterized by
 * the suggestion-driving type arguments (e.g. `VfAutoCompleteProps<typeof
 * suggestions>`). Reach for `VfAutoCompleteProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfAutoCompleteProps<
  TSuggestions extends SuggestionsProp = SuggestionsProp,
  TMultiple extends boolean = false,
  TModel = any,
> extends AutoCompleteProps<
  'auto-complete',
  TSuggestions,
  TMultiple,
  TModel,
  VfAutoCompleteSlots<TSuggestions, TMultiple, TModel>,
  VfAutoCompleteParts,
  VfAutoCompleteClasses,
  VfAutoCompleteContext<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>
> {}
```
