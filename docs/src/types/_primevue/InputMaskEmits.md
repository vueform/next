```ts
/**
 * Events emitted by the input-mask element.
 */
interface InputMaskEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<InputMaskModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    KeyEmits<TContext>,
    InputEmits<InputMaskModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AInputMaskEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
