```ts
/**
 * Props for the VfHidden component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfHiddenProps extends HiddenProps<
  'hidden',
  VfHiddenSlots,
  VfHiddenParts,
  VfHiddenClasses,
  VfHiddenContext
> {}
```
