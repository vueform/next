```ts
/**
 * Events emitted by the field element.
 */
interface FieldEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<FieldModel, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    KeyEmits<TContext>,
    InputEmits<FieldModel, TContext> {
  /**
   * Generic proxy event that the default slot can use to surface events from
   * the underlying input component.
   *
   * @param name The original event name being proxied.
   * @param args Additional event arguments.
   */
  event: [name: string, ...args: any[]]
}
```
