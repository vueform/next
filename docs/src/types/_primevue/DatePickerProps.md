```ts
/**
 * Props for the date picker element blueprint, parameterized by the
 * model-driving type argument (`selectionMode`). Plain usage
 * (`DatePickerProps`) keeps every member wide, so no separate plain-props alias
 * is needed.
 */
interface DatePickerProps<
  T extends string = 'date-picker',
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
  S = DatePickerSlots,
  P = DatePickerParts,
  C = DatePickerClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<DatePickerModelProp<TSelectionMode>, TContext>,
    ValidationProps<TContext>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext>,
    FloatLabelProps,
    IftaLabelProps,
    InfoProps,
    TooltipProps,
    /* @vue-ignore */ Omit<
      ADatePickerProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'disabled'
      | 'placeholder'
      | 'readonly'
      | 'view'
      | 'minDate'
      | 'maxDate'
      | 'selectionMode'
    > {
  /**
   * **This replaces the original PrimeVue `selectionMode` prop.** Defines the
   * quantity of the selection and controls the model value shape:
   *
   * - unset / `'single'` → `string | null`
   * - `'multiple'` / `'range'` → `string[]`
   */
  selectionMode?: TSelectionMode | 'single' | 'multiple' | 'range'

  /**
   * **This replaces the original PrimeVue `minDate` prop.** The minimum
   * selectable date as a date string.
   */
  minDate?: DProp<string | Date, TContext>

  /**
   * **This replaces the original PrimeVue `maxDate` prop.** The maximum
   * selectable date as a date string.
   */
  maxDate?: DProp<string | Date, TContext>
}
```
