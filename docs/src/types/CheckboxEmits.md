```ts
/**
 * Events emitted by the checkbox element.
 */
interface CheckboxEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<CheckboxModel, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    InputEmits<CheckboxModel, TContext> {}
```
