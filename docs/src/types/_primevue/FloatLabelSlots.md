```ts
/**
 * Float label slot mixed into element components that support PrimeVue floating
 * labels.
 */
interface FloatLabelSlots {
  /**
   * Slot for customizing the floating label content.
   *
   * @param props.floatLabel The floating label text.
   */
  floatLabel: (props: { floatLabel?: string }) => VNode[]
}
```
