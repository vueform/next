```ts
/**
 * Props for the VfElements component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfElementsProps extends ElementsProps<
  VfElementsSlots,
  VfElementsParts,
  VfElementsClasses,
  VfElementsContext
> {}
```
