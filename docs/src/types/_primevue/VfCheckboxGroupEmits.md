```ts
/**
 * Events emitted by the VfCheckboxGroup component, parameterized by the
 * option-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfCheckboxGroupSlots`. Plain usage
 * (`VfCheckboxGroupEmits`) keeps the context wide.
 */
interface VfCheckboxGroupEmits<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends CheckboxGroupEmits<
  VfCheckboxGroupContext<
    VfCheckboxGroupProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}
```
