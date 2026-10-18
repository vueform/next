```ts
/**
 * Public context for VfCheckboxGroup, optionally parameterized by concrete
 * props (e.g. `VfCheckboxGroupContext<VfCheckboxGroupProps<typeof options,
 * 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfCheckboxGroupContext<
  TProps extends WidenProps<
    VfCheckboxGroupProps,
    CheckboxGroupProps<
      string,
      OptionsProp,
      OptionValueProp,
      OptionGroupChildrenProp
    >
  > = VfCheckboxGroupProps,
> extends DefineElementContext<
  TProps,
  VfCheckboxGroupEmits,
  VfCheckboxGroupSlots,
  VfCheckboxGroupParts,
  VfCheckboxGroupClasses,
  VfCheckboxGroupModifiers,
  VfCheckboxGroupA11y,
  VfCheckboxGroupExpose,
  CheckboxGroupApi<TProps>
> {}
```
