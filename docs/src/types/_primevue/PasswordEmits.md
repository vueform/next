```ts
/**
 * Events emitted by the password element.
 */
interface PasswordEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<PasswordModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    KeyEmits<TContext>,
    InputEmits<PasswordModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      APasswordEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
