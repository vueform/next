```ts
/**
 * Events emitted by the multi-select element.
 */
interface MultiSelectEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<MultiSelectChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AMultiSelectEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
