```ts
/**
 * Generic props interface for the VfToggleSwitch component, parameterized by
 * the model-driving type arguments (e.g. `VfToggleSwitchProps<1, 0>`). Reach
 * for `VfToggleSwitchProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfToggleSwitchProps<
  TTrueValue = true,
  TFalseValue = false,
> extends ToggleSwitchProps<
  'toggle-switch',
  TTrueValue,
  TFalseValue,
  VfToggleSwitchSlots<TTrueValue, TFalseValue>,
  VfToggleSwitchParts,
  VfToggleSwitchClasses,
  VfToggleSwitchContext<VfToggleSwitchProps<TTrueValue, TFalseValue>>
> {}
```
