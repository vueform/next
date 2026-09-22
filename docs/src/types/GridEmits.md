```ts
/**
 * Events emitted by the grid element.
 */
interface GridEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<ObjectModel, TContext>,
    ValidationEmits<TContext> {}
```
