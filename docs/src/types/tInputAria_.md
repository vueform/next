```ts
/**
 * A11y pattern for translatable text inputs: the `input` bag additionally
 * references the editing-language live region and carries the input's `lang`.
 *
 * Register with `useA11y(tInputAria())`.
 */
const tInputAria: () => (
  api: LayoutPatternApi & {
    language: Ref<string>
    languageId: Ref<string>
    translatable: Ref<boolean>
    hasError: Ref<boolean>
    busy: Ref<boolean>
    required: Ref<boolean>
  }
) => TAriaA11y
```
