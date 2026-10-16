```ts
/**
 * Generic props interface for the VfCheckboxGroup component, parameterized by
 * the option-driving type arguments (e.g. `VfCheckboxGroupProps<typeof options,
 * 'id'>`). Reach for `VfCheckboxGroupProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfCheckboxGroupProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends CheckboxGroupProps<
  'checkbox-group',
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TModel,
  TOptionValueReturn,
  VfCheckboxGroupSlots<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TModel,
    TOptionValueReturn
  >,
  VfCheckboxGroupParts,
  VfCheckboxGroupClasses,
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
