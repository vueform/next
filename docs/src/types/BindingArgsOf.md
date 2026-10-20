```ts
/**
 * The call signature a part's resolver accepts: the parameters declared by
 * the key's bindings member, falling back to the PART member's functional
 * signature (parts type per-item overrides even when the component declares
 * no entries — every key is a resolver, so no definition is required to call
 * one with arguments), empty for arg-less parts.
 */
type BindingArgsOf<P, B> = [AspectArgsOf<B>] extends [never]
  ? [AspectArgsOf<P>] extends [never]
    ? []
    : AspectArgsOf<P>
  : AspectArgsOf<B>
```
