```ts
/**
 * Configuration for the checkboxes group ARIA factory resolving invalid,
 * required, and describedby attributes.
 */
type MakeCheckboxesAriaOptions = {
  deps: ReturnsOf<
    [
      [typeof makeLayout, ['errorId']],
      [typeof makeData, ['invalid', 'required', 'hasError']],
    ]
  >
}
```
