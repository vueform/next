```ts
/**
 * Props for the VfAddon component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfAddonProps extends AddonProps<
  VfAddonSlots,
  VfAddonParts,
  VfAddonClasses,
  VfAddonContext
> {}
```
