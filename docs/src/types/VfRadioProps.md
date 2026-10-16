```ts
/**
 * Generic props interface for the VfRadio component, parameterized by the
 * model-driving type argument (e.g. `VfRadioProps<'a'>`). Reach for
 * `VfRadioProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfRadioProps<TRadioValue = any> extends RadioProps<
  'radio',
  TRadioValue,
  VfRadioSlots<TRadioValue>,
  VfRadioParts,
  VfRadioClasses,
  VfRadioContext<VfRadioProps<TRadioValue>>
> {}
```
