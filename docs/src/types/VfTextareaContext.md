```ts
/**
 * Public context for VfTextarea, optionally parameterized by concrete props
 * (e.g. `VfTextareaContext<VfTextareaProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfTextareaContext<
  TProps extends WidenProps<VfTextareaProps, TextareaProps> = VfTextareaProps,
> extends DefineElementContext<
  TProps,
  VfTextareaEmits,
  VfTextareaSlots,
  VfTextareaParts,
  VfTextareaClasses,
  VfTextareaBindings,
  VfTextareaExpose,
  TextareaApi<TProps>
> {}
```
