```ts
/**
 * Generic props interface for the VfRadio component, parameterized by the
 * model-driving type argument (e.g. `VfRadioProps<'a'>`). Reach for
 * `VfRadioProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
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
