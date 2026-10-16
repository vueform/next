```ts
/**
 * @write
 */
interface BtnEmits {
  /**
   * Emitted when the button is clicked.
   *
   * @param event The native mouse event.
   * @param context$ The element's component context.
   */
  click: [event: MouseEvent, context$: LooseContext]
}
```
