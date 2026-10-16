```ts
/**
 * Public context for VfRadioButtonGroup, optionally parameterized by concrete
 * props (e.g. `VfRadioButtonGroupContext<VfRadioButtonGroupProps<typeof
 * options, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfRadioButtonGroupContext<
  TProps extends WidenProps<
    VfRadioButtonGroupProps,
    RadioButtonGroupProps<
      string,
      OptionsProp,
      OptionValueProp,
      OptionGroupChildrenProp
    >
  > = VfRadioButtonGroupProps,
> extends DefineElementContext<
  TProps,
  VfRadioButtonGroupEmits,
  VfRadioButtonGroupSlots,
  VfRadioButtonGroupParts,
  VfRadioButtonGroupClasses,
  VfRadioButtonGroupExpose,
  RadioButtonGroupApi<TProps>
> {}
```
