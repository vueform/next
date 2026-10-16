```ts
/**
 * Events emitted by the toggle-button element.
 */
interface ToggleButtonEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<any, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AToggleButtonEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
