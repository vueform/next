```ts
/**
 * Configuration for the group ARIA factory resolving the group container's
 * role, labelling, and state attributes.
 */
type MakeGroupAriaOptions = {
  props: {
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
          'genericName',
        ],
      ],
      [typeof makeData, ['invalid', 'required', 'hasError']],
    ]
  >
}
```
