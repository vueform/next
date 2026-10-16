```ts
/**
 * Events emitted by the hidden element.
 */
interface HiddenEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    ValidationEmits<TContext> {}
```
