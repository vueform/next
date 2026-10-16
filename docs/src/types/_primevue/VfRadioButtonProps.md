```ts
/**
 * Generic props interface for the VfRadioButton component, parameterized by the
 * model-driving type argument (e.g. `VfRadioButtonProps<'a'>`). Reach for
 * `VfRadioButtonProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfRadioButtonProps<TRadioValue = any> extends RadioButtonProps<
  'radio-button',
  TRadioValue,
  VfRadioButtonSlots<TRadioValue>,
  VfRadioButtonParts,
  VfRadioButtonClasses,
  VfRadioButtonContext<VfRadioButtonProps<TRadioValue>>
> {}
```
