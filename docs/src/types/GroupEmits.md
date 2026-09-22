```ts
/**
 * Events emitted by the group element.
 */
interface GroupEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<ObjectModel, TContext>,
    ValidationEmits<TContext>,
    TabbedEmits {}
```
