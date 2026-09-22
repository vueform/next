```ts
/**
 * Props for the VfAddon component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
interface VfAddonProps extends AddonProps<
  VfAddonSlots,
  VfAddonParts,
  VfAddonClasses,
  VfAddonContext
> {}
```
