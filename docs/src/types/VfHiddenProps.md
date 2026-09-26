```ts
/**
 * Props for the VfHidden component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfHiddenProps extends HiddenProps<
  'hidden',
  VfHiddenSlots,
  VfHiddenParts,
  VfHiddenClasses,
  VfHiddenContext
> {}
```
