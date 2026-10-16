```ts
/**
 * Events emitted by the cascade-select element.
 */
interface CascadeSelectEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<CascadeSelectChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ACascadeSelectEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
