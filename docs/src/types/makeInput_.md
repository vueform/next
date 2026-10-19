```ts
/**
 * Provides the user-input pipeline: the template ref to the underlying input,
 * the unified `handleInput` intent handler, DOM recovery for value changes no
 * bound event reported, and the spreadable binding bags.
 */
const makeInput: (
  config?: MakeInputConfig | undefined
) => (options: MakeInputOptions) => {
  inputRef: Ref<any, any>
  setInputRef: (el: any) => void
  canonicalDomValue: ComputedRef<boolean>
  handleInput: (payload: any, e?: Event) => void
  inputBindings: ComputedRef<{
    ref: (el: any) => void
    onBlur?: ((e: Event) => void) | undefined
    onFocus?: ((e: Event) => void) | undefined
    onInput: (payload: any, e?: Event) => void
  }>
  componentBindings: ComputedRef<{
    onBlur?: ((e: Event) => void) | undefined
    onFocus?: ((e: Event) => void) | undefined
    modelValue: any
    'onUpdate:modelValue': (value: any) => void
  }>
}
```
