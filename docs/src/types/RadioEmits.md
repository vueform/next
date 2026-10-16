```ts
/**
 * Events emitted by the radio element.
 */
interface RadioEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<RadioModel, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    InputEmits<RadioModel, TContext> {}
```
