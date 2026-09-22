```ts
/**
 * Events emitted by the VfCascadeSelect component, parameterized by the
 * option-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfCascadeSelectSlots`. Plain usage
 * (`VfCascadeSelectEmits`) keeps the context wide.
 */
interface VfCascadeSelectEmits<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends CascadeOptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends CascadeSelectEmits<
  VfCascadeSelectContext<
    VfCascadeSelectProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}
```
