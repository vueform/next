```ts
/**
 * Events emitted by the date picker element.
 */
interface DatePickerEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<DatePickerModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<DatePickerModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ADatePickerEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
