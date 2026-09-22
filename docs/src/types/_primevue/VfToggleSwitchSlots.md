```ts
/**
 * Slots available in the VfToggleSwitch component.
 */
interface VfToggleSwitchSlots<TTrueValue = true, TFalseValue = false>
  extends
    ToggleSwitchSlots<
      VfToggleSwitchContext<VfToggleSwitchProps<TTrueValue, TFalseValue>>
    >,
    /* @vue-ignore */ ForwardedSlots<
      AToggleSwitchSlots,
      (typeof forwards.slots)[number]
    > {
  /**
   * Custom handle template.
   *
   * @param props.checked Current checked state of the item as a boolean.
   */
  handle(props: {
    /**
     * Current checked state of the item as a boolean.
     */
    checked: boolean
  }): VNode[]
}
```
