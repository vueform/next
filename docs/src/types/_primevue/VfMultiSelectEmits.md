```ts
/**
 * Events emitted by the VfMultiSelect component, parameterized by the
 * option-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfMultiSelectSlots`. Plain usage
 * (`VfMultiSelectEmits`) keeps the context wide.
 */
interface VfMultiSelectEmits<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends MultiSelectEmits<
  VfMultiSelectContext<
    VfMultiSelectProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}
```
