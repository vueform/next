```ts
/**
 * Public context for VfCascadeSelect, optionally parameterized by concrete
 * props (e.g. `VfCascadeSelectContext<VfCascadeSelectProps<typeof options,
 * 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfCascadeSelectContext<
  TProps extends WidenProps<
    VfCascadeSelectProps,
    CascadeSelectProps<
      string,
      OptionsProp,
      OptionValueProp,
      CascadeOptionGroupChildrenProp
    >
  > = VfCascadeSelectProps,
> extends DefineElementContext<
  TProps,
  VfCascadeSelectEmits,
  VfCascadeSelectSlots,
  VfCascadeSelectParts,
  VfCascadeSelectClasses,
  VfCascadeSelectExpose,
  CascadeSelectApi<TProps>
> {}
```
