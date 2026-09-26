```ts
/**
 * Provides translatable state, language resolution, and the language selector
 * addon schema for elements that support multilingual values.
 *
 * @param options Factory options containing element props and dependencies.
 */
const makeMultilingual: (
  config?: unknown
) => (options: makeMultilingualOptions) => {
  translateAddon: ComputedRef<any>
  language: Ref<string, string>
  languageId: ComputedRef<string | undefined>
  languages: Ref<ResolvedLanguagesProp, ResolvedLanguagesProp>
  translatable: ComputedRef<boolean>
}
```
