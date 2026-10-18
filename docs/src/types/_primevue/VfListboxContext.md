```ts
/**
 * Public context for VfListbox, optionally parameterized by concrete props
 * (e.g. `VfListboxContext<VfListboxProps<typeof options, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfListboxContext<
  TProps extends WidenProps<
    VfListboxProps,
    ListboxProps<string, OptionsProp, OptionValueProp, OptionGroupChildrenProp>
  > = VfListboxProps,
> extends DefineElementContext<
  TProps,
  VfListboxEmits,
  VfListboxSlots,
  VfListboxParts,
  VfListboxClasses,
  VfListboxModifiers,
  VfListboxA11y,
  VfListboxExpose,
  ListboxApi<TProps>
> {}
```
