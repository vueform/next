```ts
/**
 * Props for the VfGroup component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfGroupProps extends GroupProps<
  'group',
  VfGroupSlots,
  VfGroupParts,
  VfGroupClasses,
  VfGroupContext
> {}
```
