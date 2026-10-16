```ts
/**
 * Configuration for the checkbox ARIA factory resolving describedby, invalid,
 * required, and busy attributes.
 */
type MakeCheckboxAriaOptions = {
  props: {
    aria: AriaProp | undefined
    label: TProp | undefined
    help: TProp | undefined
    description: TProp | undefined
  }

  deps: ReturnsOf<
    [
      [typeof makeLayout, ['labelId', 'helpId', 'descriptionId', 'errorId']],
      [typeof makeData, ['hasError', 'busy', 'required']],
      [typeof makeText, ['text']],
    ]
  >
}
```
