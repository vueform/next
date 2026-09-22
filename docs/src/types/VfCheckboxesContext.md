```ts
/**
 * Public context for VfCheckboxes, optionally parameterized by concrete props
 * (e.g. `VfCheckboxesContext<VfCheckboxesProps<typeof items, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfCheckboxesContext<
  TProps extends WidenProps<
    VfCheckboxesProps,
    CheckboxesProps<string, ItemsProp, ItemValueProp, GroupChildrenProp>
  > = VfCheckboxesProps,
> extends DefineElementContext<
  TProps,
  VfCheckboxesEmits,
  VfCheckboxesSlots,
  VfCheckboxesParts,
  VfCheckboxesClasses,
  VfCheckboxesExpose,
  CheckboxesApi<TProps>
> {}
```
