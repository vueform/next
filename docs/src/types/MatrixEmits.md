```ts
/**
 * Events emitted by the matrix element.
 */
interface MatrixEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<ObjectModel, TContext>,
    ValidationEmits<TContext> {}
```
