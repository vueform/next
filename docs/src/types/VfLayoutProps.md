```ts
/**
 * Props for the VfLayout component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfLayoutProps extends LayoutProps<
  VfLayoutSlots,
  VfLayoutParts,
  VfLayoutClasses,
  VfLayoutContext
> {}
```
