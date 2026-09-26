```ts
/**
 * Props for the VfGroup component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfGroupProps extends GroupProps<
  'group',
  VfGroupSlots,
  VfGroupParts,
  VfGroupClasses,
  VfGroupContext
> {}
```
