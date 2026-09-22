```ts
/**
 * Props for the VfGroup component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
interface VfGroupProps extends GroupProps<
  'group',
  VfGroupSlots,
  VfGroupParts,
  VfGroupClasses,
  VfGroupContext
> {}
```
