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
   * @param scope The handle slot's params.
   */
  handle(scope: {
    /**
     * Current checked state of the item as a boolean.
     */
    checked: boolean
  }): VNode[]
}
```
