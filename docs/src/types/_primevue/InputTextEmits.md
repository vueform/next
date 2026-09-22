```ts
/**
 * Events emitted by the input-text element.
 */
interface InputTextEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<InputTextModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    KeyEmits<TContext>,
    InputEmits<InputTextModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AInputTextEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
