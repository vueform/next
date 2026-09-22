```ts
/**
 * Events emitted by the VfSelect component, parameterized by the item-driving
 * type arguments so event handlers (e.g. `@change`) receive the narrowed
 * context — same pattern as `VfSelectSlots`. Plain usage (`VfSelectEmits`)
 * keeps the context wide.
 */
interface VfSelectEmits<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
> extends SelectEmits<
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
