```ts
/**
 * Events emitted by the tree-select element.
 */
interface TreeSelectEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<string[], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ATreeSelectEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
