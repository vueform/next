```ts
/**
 * Events emitted by the listbox element.
 */
interface ListboxEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<ListboxChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AListboxEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
