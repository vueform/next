```ts
/**
 * Events emitted by the VfCheckboxes component, parameterized by the
 * item-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfCheckboxesSlots`. Plain usage
 * (`VfCheckboxesEmits`) keeps the context wide.
 */
interface VfCheckboxesEmits<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
> extends CheckboxesEmits<
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
