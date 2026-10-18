```ts
/**
 * Props for the color-picker element blueprint.
 *
 * Non-generic counterpart — no item-driving type parameters. The plain props
 * type and the props interface are the same shape.
 */
interface ColorPickerProps<
  T extends string = 'color-picker',
  S = ColorPickerSlots,
  P = ColorPickerParts,
  C = ColorPickerClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<TextModel, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    InfoProps,
    AlignedProps,
    /* @vue-ignore */ Omit<
      AColorPickerProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'inputId'
      | 'format'
      | 'defaultColor'
    > {
  /**
   * Format to use in value binding, supported formats are `'hex'`, `'rgb'` and
   * `'hsb'`.
   */
  format?: DProp<ColorFormat>

  /**
   * Initial color to display when value is not defined and the format is `hex`.
   */
  defaultColor?: any

  /**
   * Initial color to display when value is not defined and the format is `rgb`.
   */
  defaultRgb?: { r: number; g: number; b: number }

  /**
   * Initial color to display when value is not defined and the format is `hsb`.
   */
  defaultHsb?: { h: number; s: number; b: number }
}
```
