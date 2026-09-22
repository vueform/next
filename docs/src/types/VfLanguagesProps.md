```ts
/**
 * Props for the VfLanguages component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
interface VfLanguagesProps extends LanguagesProps<
  VfLanguagesSlots,
  VfLanguagesParts,
  VfLanguagesClasses,
  VfLanguagesContext
> {}
```
