```ts
/**
 * Generic props interface for the VfCheckboxes component, parameterized by the
 * item-driving type arguments (e.g. `VfCheckboxesProps<typeof items, 'id'>`).
 * Reach for `VfCheckboxesProps` instead when no narrowing is needed.
 */
interface VfCheckboxesProps<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
> extends CheckboxesProps<
  'checkboxes',
  TItems,
  TItemValueKey,
  TGroupChildren,
  TModel,
  TItemValueReturn,
  VfCheckboxesSlots<
    TItems,
    TItemValueKey,
    TGroupChildren,
    TModel,
    TItemValueReturn
  >,
  VfCheckboxesParts,
  VfCheckboxesClasses,
  VfCheckboxesContext<
    VfCheckboxesProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {}
```
