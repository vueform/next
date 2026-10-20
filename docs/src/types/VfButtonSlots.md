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

    /**
     * The label text element's resolved bindings (part overrides); apply
     * with `v-bind`.
     */
    bindings: PartBindings<'text', VfButtonParts, VfButtonBindings>
  }) => VNode[]

  /**
   * Slot for content rendered after the label.
   */
  after: () => VNode[]
}
```
