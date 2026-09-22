```ts
/**
 * Props for the VfToggleButton component.
 *
 * Non-generic — `onLabel` / `offLabel` are display strings and do not drive the
 * model. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
interface VfToggleButtonProps extends ToggleButtonProps<
  'toggle-button',
  VfToggleButtonSlots,
  VfToggleButtonParts,
  VfToggleButtonClasses,
  VfToggleButtonContext
> {}
```
