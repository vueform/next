```ts
/**
 * Configuration for the ARIA factory wiring ARIA attributes and described-by
 * relationships.
 */
type MakeAriaOptions = {
  props: {
    aria: AriaProp | undefined
  }
  deps: ReturnsOf<
    [
      [
        typeof makeLayout,
        ['helpId', 'descriptionId', 'errorId', 'help', 'description'],
      ],
      [typeof makeData, ['hasError', 'busy', 'required']],
    ]
  >
}
```
