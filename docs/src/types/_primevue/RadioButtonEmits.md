```ts
/**
 * Events emitted by the radio-button element.
 */
interface RadioButtonEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<RadioButtonModel, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    InputEmits<RadioButtonModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ARadioButtonEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
