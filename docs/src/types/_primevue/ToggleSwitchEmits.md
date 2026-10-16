```ts
/**
 * Events emitted by the toggle-switch element.
 */
interface ToggleSwitchEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<ToggleSwitchModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<ToggleSwitchModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AToggleSwitchEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
