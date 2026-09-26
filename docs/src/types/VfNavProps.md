```ts
/**
 * Props for the VfNav component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfNavProps extends NavProps<
  VfNavSlots,
  VfNavParts,
  VfNavClasses,
  VfNavContext
> {}
```
