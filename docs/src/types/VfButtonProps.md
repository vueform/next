```ts
/**
 * Props for the VfButton component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfButtonProps extends ButtonProps<
  'button',
  VfButtonSlots,
  VfButtonParts,
  VfButtonClasses,
  VfButtonContext
> {}
```
