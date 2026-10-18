```ts
/**
 * Public context for VfToggleSwitch, optionally parameterized by concrete props
 * (e.g. `VfToggleSwitchContext<VfToggleSwitchProps<1, 0>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfToggleSwitchContext<
  TProps extends WidenProps<VfToggleSwitchProps, ToggleSwitchProps> =
    VfToggleSwitchProps,
> extends DefineElementContext<
  TProps,
  VfToggleSwitchEmits,
  VfToggleSwitchSlots,
  VfToggleSwitchParts,
  VfToggleSwitchClasses,
  VfToggleSwitchModifiers,
  VfToggleSwitchA11y,
  VfToggleSwitchExpose,
  ToggleSwitchApi<TProps>
> {}
```
