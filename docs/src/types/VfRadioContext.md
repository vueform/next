```ts
/**
 * Public context for VfRadio, optionally parameterized by concrete props (e.g.
 * `VfRadioContext<VfRadioProps<'a'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfRadioContext<
  TProps extends WidenProps<VfRadioProps, RadioProps> = VfRadioProps,
> extends DefineElementContext<
  TProps,
  VfRadioEmits,
  VfRadioSlots,
  VfRadioParts,
  VfRadioClasses,
  VfRadioBindings,
  VfRadioExpose,
  RadioApi<TProps>
> {}
```
