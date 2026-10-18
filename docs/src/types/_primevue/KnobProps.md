```ts
/**
 * Props for the knob element blueprint.
 *
 * Non-generic counterpart — no model-driving type parameters. The plain props
 * type and the props interface are the same shape.
 */
interface KnobProps<
  T extends string = 'knob',
  S = KnobSlots,
  P = KnobParts,
  C = KnobClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<TextishModel, TContext>,
    ValidationProps<TContext>,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    InfoProps,
    IntervalProps,
    /* @vue-ignore */ Omit<
      AKnobProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'readonly'
      | 'min'
      | 'max'
      | 'step'
    > {
  /**
   * Whether the content of the element should be centered
   */
  centered?: boolean
}
```
