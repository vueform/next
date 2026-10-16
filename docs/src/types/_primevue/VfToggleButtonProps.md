```ts
/**
 * Props for the VfToggleButton component.
 *
 * Non-generic — `onLabel` / `offLabel` are display strings and do not drive the
 * model. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfToggleButtonProps extends ToggleButtonProps<
  'toggle-button',
  VfToggleButtonSlots,
  VfToggleButtonParts,
  VfToggleButtonClasses,
  VfToggleButtonContext
> {}
```
