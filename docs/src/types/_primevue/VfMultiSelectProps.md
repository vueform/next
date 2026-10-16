```ts
/**
 * Generic props interface for the VfMultiSelect component, parameterized by the
 * option-driving type arguments (e.g. `VfMultiSelectProps<typeof options,
 * 'id'>`). Reach for `VfMultiSelectProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfMultiSelectProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends MultiSelectProps<
  'multi-select',
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TModel,
  TOptionValueReturn,
  VfMultiSelectSlots<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TModel,
    TOptionValueReturn
  >,
  VfMultiSelectParts,
  VfMultiSelectClasses,
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
