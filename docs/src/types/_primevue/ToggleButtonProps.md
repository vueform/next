```ts
/**
 * Props for the toggle-button element blueprint.
 *
 * Non-generic counterpart — `onLabel` / `offLabel` are display strings and do
 * not drive the model (PrimeVue ToggleButton is boolean). The plain props type
 * and the props interface are the same shape.
 */
interface ToggleButtonProps<
  T extends string = 'toggle-button',
  S = ToggleButtonSlots,
  P = ToggleButtonParts,
  C = ToggleButtonClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<any, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    InfoProps,
    /* @vue-ignore */ Omit<
      AToggleButtonProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'readonly'
      | 'onLabel'
      | 'offLabel'
      | 'onIcon'
      | 'offIcon'
    > {
  /**
   * Label displayed when the toggle button is in the on state.
   */
  onLabel?: TProp

  /**
   * Label displayed when the toggle button is in the off state.
   */
  offLabel?: TProp

  /**
   * Icon displayed when the toggle button is in the on state.
   */
  onIcon?: DProp

  /**
   * Icon displayed when the toggle button is in the off state.
   */
  offIcon?: DProp
}
```
