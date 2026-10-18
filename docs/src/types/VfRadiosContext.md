```ts
/**
 * Public context for VfRadios, optionally parameterized by concrete props (e.g.
 * `VfRadiosContext<VfRadiosProps<typeof items, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfRadiosContext<
  TProps extends WidenProps<
    VfRadiosProps,
    RadiosProps<string, ItemsProp, ItemValueProp, GroupChildrenProp>
  > = VfRadiosProps,
> extends DefineElementContext<
  TProps,
  VfRadiosEmits,
  VfRadiosSlots,
  VfRadiosParts,
  VfRadiosClasses,
  VfRadiosModifiers,
  VfRadiosA11y,
  VfRadiosExpose,
  RadiosApi<TProps>
> {}
```
