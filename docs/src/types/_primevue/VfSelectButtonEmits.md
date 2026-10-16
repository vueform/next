```ts
/**
 * Events emitted by the VfSelectButton component, parameterized by the
 * option-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfSelectButtonSlots`. Plain usage
 * (`VfSelectButtonEmits`) keeps the context wide.
 */
interface VfSelectButtonEmits<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> extends SelectButtonEmits<
  VfSelectButtonContext<
    VfSelectButtonProps<
      TOptions,
      TOptionValueKey,
      TMultiple,
      TModel,
      TOptionValueReturn
    >
  >
> {}
```
