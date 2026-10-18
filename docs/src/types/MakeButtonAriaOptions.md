```ts
/**
 * Configuration for the button ARIA factory resolving the control's
 * native/ARIA disabled mode, busy state, icon-only labelling, and describedby.
 */
type MakeButtonAriaOptions = {
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
          'help',
          'helpId',
          'description',
          'descriptionId',
          'errorId',
          'genericName',
        ],
      ],
      [typeof makeDisabled, ['disabled']],
      [
        typeof makeButton,
        ['href', 'to', 'icon', 'text', 'loading', 'displayErrors'],
      ],
    ]
  >
}
```
