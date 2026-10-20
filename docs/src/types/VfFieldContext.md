```ts
/**
 * Public context for VfField, optionally parameterized by concrete props (e.g.
 * `VfFieldContext<VfFieldProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfFieldContext<
  TProps extends WidenProps<VfFieldProps, FieldProps> = VfFieldProps,
> extends DefineElementContext<
  TProps,
  VfFieldEmits,
  VfFieldSlots,
  VfFieldParts,
  VfFieldClasses,
  VfFieldBindings,
  VfFieldExpose,
  FieldApi<TProps>
> {}
```
