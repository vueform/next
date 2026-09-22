```ts
/**
 * Generic props interface for the VfToggleSwitch component, parameterized by
 * the model-driving type arguments (e.g. `VfToggleSwitchProps<1, 0>`). Reach
 * for `VfToggleSwitchProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
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
