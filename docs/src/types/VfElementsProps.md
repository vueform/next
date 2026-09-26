```ts
/**
 * Props for the VfElements component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfElementsProps extends ElementsProps<
  VfElementsSlots,
  VfElementsParts,
  VfElementsClasses,
  VfElementsContext
> {}
```
