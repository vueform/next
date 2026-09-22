```ts
/**
 * Events emitted by the color-picker element.
 */
interface ColorPickerEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<TextModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<ColorPickerChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AColorPickerEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
