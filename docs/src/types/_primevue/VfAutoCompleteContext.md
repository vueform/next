```ts
/**
 * Public context for VfAutoComplete, optionally parameterized by concrete props
 * (e.g. `VfAutoCompleteContext<VfAutoCompleteProps<typeof suggestions>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfAutoCompleteContext<
  TProps extends WidenProps<
    VfAutoCompleteProps,
    AutoCompleteProps<string, SuggestionsProp>
  > = VfAutoCompleteProps,
> extends DefineElementContext<
  TProps,
  VfAutoCompleteEmits,
  VfAutoCompleteSlots,
  VfAutoCompleteParts,
  VfAutoCompleteClasses,
  VfAutoCompleteExpose,
  AutoCompleteApi<TProps>
> {}
```
