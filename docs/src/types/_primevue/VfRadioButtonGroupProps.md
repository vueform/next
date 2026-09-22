```ts
/**
 * Generic props interface for the VfRadioButtonGroup component, parameterized
 * by the option-driving type arguments (e.g. `VfRadioButtonGroupProps<typeof
 * options, 'id'>`). Reach for `VfRadioButtonGroupProps` instead when no
 * narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
interface VfRadioButtonGroupProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends RadioButtonGroupProps<
  'radio-button-group',
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TModel,
  TOptionValueReturn,
  VfRadioButtonGroupSlots<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TModel,
    TOptionValueReturn
  >,
  VfRadioButtonGroupParts,
  VfRadioButtonGroupClasses,
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
