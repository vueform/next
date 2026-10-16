```ts
/**
 * Events emitted by the auto-complete element.
 */
interface AutoCompleteEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<AutoCompleteChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AAutoCompleteEmits,
      (typeof forwards.events)[number],
      TContext
    > {
  /**
   * Callback to invoke to search for suggestions.
   *
   * @param event Custom complete event.
   * @param context$ The component context.
   */
  complete: [event: AutoCompleteCompleteEvent, context$: TContext]
}
```
