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

    /**
     * The handle element's resolved bindings (classes, part overrides); apply
     * with `v-bind`.
     */
    bindings: PartBindings<
      'handle',
      VfToggleSwitchParts,
      VfToggleSwitchModifiers,
      VfToggleSwitchA11y
    >
  }): VNode[]
}
```
