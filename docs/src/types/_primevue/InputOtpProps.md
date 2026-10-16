```ts
/**
 * Props for the input-otp element blueprint.
 *
 * Non-generic counterpart — no model-driving type parameters. The plain props
 * type and the props interface are the same shape.
 */
interface InputOtpProps<
  T extends string = 'input-otp',
  S = InputOtpSlots,
  P = InputOtpParts,
  C = InputOtpClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<OtpModel, TContext>,
    ValidationProps<TContext>,
    AriaProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    InfoProps,
    TooltipProps,
    /* @vue-ignore */ Omit<
      AInputOtpProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'readonly'
      | 'length'
    >,
    Pick<AInputOtpProps, 'length'> {}
```
