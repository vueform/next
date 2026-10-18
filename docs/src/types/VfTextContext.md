```ts
/**
 * Public context for VfText, optionally parameterized by concrete props (e.g.
 * `VfTextContext<VfTextProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfTextContext<
  TProps extends WidenProps<VfTextProps, TextProps> = VfTextProps,
> extends DefineElementContext<
  TProps,
  VfTextEmits,
  VfTextSlots,
  VfTextParts,
  VfTextClasses,
  VfTextModifiers,
  VfTextA11y,
  VfTextExpose,
  TextApi<TProps>
> {}
```
