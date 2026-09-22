```ts
/**
 * Events emitted by the input-otp element.
 */
interface InputOtpEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<OtpModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<InputOtpChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AInputOtpEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
