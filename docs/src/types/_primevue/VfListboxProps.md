```ts
/**
 * Generic props interface for the VfListbox component, parameterized by the
 * option-driving type arguments (e.g. `VfListboxProps<typeof options, 'id'>`).
 * Reach for `VfListboxProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
interface VfListboxProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> extends ListboxProps<
  'listbox',
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TMultiple,
  TModel,
  TOptionValueReturn,
  VfListboxSlots<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TMultiple,
    TModel,
    TOptionValueReturn
  >,
  VfListboxParts,
  VfListboxClasses,
  VfListboxContext<
    VfListboxProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TMultiple,
      TModel,
      TOptionValueReturn
    >
  >
> {}
```
