```ts
/**
 * Base public context for form elements (e.g. select, text). Extends
 * `BaseComponentContext` (same shape today; reserved for element-only fields).
 *
 * `TApi` is typically `typeof setup`.
 */
type BaseElementContext<
  TApi,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any> = {},
  TSlots extends Record<string, any> = Record<string, any>,
  TParts extends Record<string, any> = Record<string, any>,
  TClasses extends Record<string, any> = Record<string, any>,
  TModifiers = DefaultContextModifiers<TApi, TSlots>,
  TA11y = DefaultContextA11y<TApi, TSlots>,
> = BaseComponentContext<
  TApi,
  TProps,
  TEvents,
  TSlots,
  TParts,
  TClasses,
  TModifiers,
  TA11y
>
```
