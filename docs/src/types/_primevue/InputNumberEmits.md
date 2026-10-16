```ts
/**
 * Events emitted by the input-number element.
 */
interface InputNumberEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<TextishModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<TextishModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AInputNumberEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
