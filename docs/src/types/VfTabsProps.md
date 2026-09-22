```ts
/**
 * Props for the VfTabs component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
interface VfTabsProps extends TabsProps<
  VfTabsSlots,
  VfTabsParts,
  VfTabsClasses,
  VfTabsContext
> {}
```
