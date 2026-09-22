```ts
/**
 * Generic props interface for the VfRadios component, parameterized by the
 * item-driving type arguments (e.g. `VfRadiosProps<typeof items, 'id'>`). Reach
 * for `VfRadiosProps` instead when no narrowing is needed.
 */
interface VfRadiosProps<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
> extends RadiosProps<
  'radios',
  TItems,
  TItemValueKey,
  TGroupChildren,
  TModel,
  TItemValueReturn,
  VfRadiosSlots<
    TItems,
    TItemValueKey,
    TGroupChildren,
    TModel,
    TItemValueReturn
  >,
  VfRadiosParts,
  VfRadiosClasses,
  VfRadiosContext<
    VfRadiosProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {}
```
