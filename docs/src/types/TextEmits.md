```ts
/**
 * Events emitted by the text element.
 */
interface TextEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<TextModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    KeyEmits<TContext>,
    InputEmits<TextModel, TContext> {}
```
