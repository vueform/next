```ts
/**
 * Binding pattern for translatable text inputs: the `input` entry
 * additionally references the editing-language live region and carries the
 * input's `lang`.
 *
 * Register with `useBindings(tInputAria(api))`.
 *
 * @param api The component api slice the entries read.
 */
const tInputAria: (
  api: LayoutPatternApi & {
    language: Ref<string>
    languageId: Ref<string | undefined>
    translatable: Ref<boolean>
    hasError: Ref<boolean>
    busy: Ref<boolean>
    required: Ref<boolean>
  }
) => Prettify<BindingDefsOf<LayoutRegionBindings & { input: TInputAriaBag }>>
```
