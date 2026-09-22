```ts
/**
 * Events emitted by the list element.
 */
interface ListEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<ArrayModel, TContext>,
    ValidationEmits<TContext> {}
```
