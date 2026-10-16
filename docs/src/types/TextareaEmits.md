```ts
/**
 * Events emitted by the textarea element.
 */
interface TextareaEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<TranslatableModel, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    KeyEmits<TContext>,
    InputEmits<TranslatableModel, TContext> {}
```
