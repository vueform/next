```ts
/**
 * Events emitted by the slider element.
 */
interface SliderEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<SliderModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<number | number[], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ASliderEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
