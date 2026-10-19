```ts
/**
 * Configuration for the autocomplete factory resolving the input's
 * `autocomplete` attribute value.
 */
type MakeAutocompleteOptions = {
  props: {
    autocomplete: string | undefined
  }
  deps: ReturnsOf<[[typeof makeElement, ['name']]]>
}
```
