```ts
/**
 * Float label slot mixed into element components that support PrimeVue floating
 * labels.
 */
interface FloatLabelSlots {
  /**
   * Slot for customizing the floating label content.
   *
   * @param scope The floatLabel slot's params.
   */
  floatLabel: (scope: {
    /**
     * The floating label text.
     */
    floatLabel?: string
  }) => VNode[]
}
```
