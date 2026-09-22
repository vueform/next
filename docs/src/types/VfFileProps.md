```ts
/**
 * Generic props interface for the VfFile component, parameterized by the
 * model-driving type argument (e.g. `VfFileProps<true>`). Reach for
 * `VfFileProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
interface VfFileProps<TMultiple extends boolean = boolean> extends FileProps<
  'file',
  TMultiple,
  VfFileSlots<TMultiple>,
  VfFileParts,
  VfFileClasses,
  VfFileContext<VfFileProps<TMultiple>>
> {}
```
