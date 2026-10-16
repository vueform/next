```ts
/**
 * Events emitted by the select-button element.
 */
interface SelectButtonEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<SelectButtonChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ASelectButtonEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
