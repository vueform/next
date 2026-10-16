```ts
/**
 * Slots available in the VfButton component.
 */
interface VfButtonSlots extends ButtonSlots<VfButtonContext> {
  /**
   * Slot for content rendered before the label.
   */
  before: () => VNode[]

  /**
   * Default slot that replaces the button label content.
   *
   * @param scope The default slot's params.
   */
  default: (scope: {
    /**
     * The resolved button label text.
     */
    text: string | undefined
  }) => VNode[]

  /**
   * Slot for content rendered after the label.
   */
  after: () => VNode[]
}
```
