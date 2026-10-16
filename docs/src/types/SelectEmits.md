```ts
/**
 * Events emitted by the select element.
 */
interface SelectEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    InputEmits<any, TContext> {}
```
