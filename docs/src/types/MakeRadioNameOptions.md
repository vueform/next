```ts
/**
 * Configuration for the radio name factory resolving the HTML name attribute
 * and standalone radio group behavior.
 */
type MakeRadioNameOptions = {
  props: {
    /**
     * Overrides the HTML `name` attribute for the radio input.
     */
    radioName: TProp | undefined

    type: any
  }

  deps: ReturnsOf<
    [
      [typeof makeElement, ['container', 'path', 'form$']],
      [typeof makeData, ['value']],
    ]
  >
}
```
