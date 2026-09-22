```ts
/**
 * Generic props interface for the VfSelect component, parameterized by the
 * item-driving type arguments (e.g. `VfSelectProps<typeof items, 'id'>`). Reach
 * for `VfSelectProps` instead when no narrowing is needed.
 */
interface VfSelectProps<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
> extends SelectProps<
  'select',
  TItems,
  TItemValueKey,
  TGroupChildren,
  TMultiple,
  TModel,
  TItemValueReturn,
  VfSelectSlots<
    TItems,
    TItemValueKey,
    TGroupChildren,
    TMultiple,
    TModel,
    TItemValueReturn
  >,
  VfSelectParts,
  VfSelectClasses,
  VfSelectContext<
    VfSelectProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TMultiple,
      TModel,
      TItemValueReturn
    >
  >
> {}
```
