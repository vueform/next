```ts
/**
 * Events emitted by the knob element.
 */
interface KnobEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<TextishModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<number, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AKnobEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
