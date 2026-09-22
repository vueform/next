```ts
/**
 * Configuration for the radios group ARIA factory resolving invalid, required,
 * and describedby attributes.
 */
type MakeRadiosAriaOptions = {
  deps: ReturnsOf<
    [
      [typeof makeLayout, ['errorId']],
      [typeof makeData, ['invalid', 'required', 'hasError']],
    ]
  >
}
```
