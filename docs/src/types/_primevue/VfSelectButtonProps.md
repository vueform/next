```ts
/**
 * Generic props interface for the VfSelectButton component, parameterized by
 * the option-driving type arguments (e.g. `VfSelectButtonProps<typeof options,
 * 'id'>`). Reach for `VfSelectButtonProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
interface VfSelectButtonProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> extends SelectButtonProps<
  'select-button',
  TOptions,
  TOptionValueKey,
  TMultiple,
  TModel,
  TOptionValueReturn,
  VfSelectButtonSlots<
    TOptions,
    TOptionValueKey,
    TMultiple,
    TModel,
    TOptionValueReturn
  >,
  VfSelectButtonParts,
  VfSelectButtonClasses,
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
