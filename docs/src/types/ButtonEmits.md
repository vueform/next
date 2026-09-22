```ts
/**
 * Events emitted by the button element.
 */
interface ButtonEmits<TContext = any>
  extends BaseElementEmits<TContext>, BtnEmits, InteractionEmits<TContext> {}
```
