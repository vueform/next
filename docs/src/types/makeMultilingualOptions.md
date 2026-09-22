```ts
/**
 * Configuration for the translatable factory handling language resolution and
 * the language selector addon.
 */
type makeMultilingualOptions = {
  props: {
    languages: LanguagesProp | undefined
    language: string | undefined
    translate: boolean | undefined
  }
  deps: ReturnsOf<[[typeof makeElement, ['id']]]>
}
```
