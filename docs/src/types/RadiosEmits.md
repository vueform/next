```ts
/**
 * Events emitted by the radios element.
 */
interface RadiosEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext> {}
```
