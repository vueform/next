```ts
/**
 * Events emitted by the rating element.
 */
interface RatingEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<TextishModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<RatingChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ARatingEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
