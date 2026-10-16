```ts
/**
 * Generic props interface for the VfCheckbox component, parameterized by the
 * model-driving type arguments (e.g. `VfCheckboxProps<1, 0>`). Reach for
 * `VfCheckboxProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfCheckboxProps<
  TTrueValue = any,
  TFalseValue = any,
> extends CheckboxProps<
  'checkbox',
  TTrueValue,
  TFalseValue,
  VfCheckboxSlots<TTrueValue, TFalseValue>,
  VfCheckboxParts,
  VfCheckboxClasses,
  VfCheckboxContext<VfCheckboxProps<TTrueValue, TFalseValue>>
> {}
```
