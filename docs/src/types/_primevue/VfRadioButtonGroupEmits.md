```ts
/**
 * Events emitted by the VfRadioButtonGroup component, parameterized by the
 * option-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfRadioButtonGroupSlots`. Plain usage
 * (`VfRadioButtonGroupEmits`) keeps the context wide.
 */
interface VfRadioButtonGroupEmits<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends RadioButtonGroupEmits<
  VfRadioButtonGroupContext<
    VfRadioButtonGroupProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}
```
