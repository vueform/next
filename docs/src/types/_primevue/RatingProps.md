```ts
/**
 * Props for the rating element blueprint.
 *
 * Non-generic counterpart — no model-driving type parameters. The plain props
 * type and the props interface are the same shape.
 */
interface RatingProps<
  T extends string = 'rating',
  S = RatingSlots,
  P = RatingParts,
  C = RatingClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<TextishModel, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    AriaProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    InfoProps,
    AlignedProps,
    /* @vue-ignore */ Omit<
      ARatingProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'readonly'
    > {}
```
