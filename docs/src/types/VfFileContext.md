```ts
/**
 * Public context for VfFile, optionally parameterized by concrete props (e.g.
 * `VfFileContext<VfFileProps<true>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfFileContext<
  TProps extends WidenProps<VfFileProps, FileProps> = VfFileProps,
> extends DefineElementContext<
  TProps,
  VfFileEmits,
  VfFileSlots,
  VfFileParts,
  VfFileClasses,
  VfFileBindings,
  VfFileExpose,
  FileApi<TProps>
> {}
```
