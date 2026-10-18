```ts
/**
 * Configuration for the ARIA factory wiring the input's ARIA state and the
 * layout parts' id relationships.
 */
type MakeAriaOptions = {
  props: {
    /**
     * When `false`, the element renders without its layout (no label, help,
     * description, or error regions), so no describedby relationship can be
     * established.
     */
    layout?: unknown

    /**
     * When `true`, the label group (which also hosts the help region) is not
     * rendered.
     */
    hideLabel?: boolean
  }
  deps: ReturnsOf<
    [
      [
        typeof makeLayout,
        [
          'label',
          'labelId',
          'helpId',
          'descriptionId',
          'errorId',
          'help',
          'description',
        ],
      ],
      [typeof makeData, ['hasError', 'busy', 'required']],
    ]
  >
}
```
