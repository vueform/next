```ts
/**
 * Remaps one event-tuple's args, replacing every `LooseContext` placeholder
 * with `Ctx`.
 */
type RemapContextArgs<Args, Ctx> = {
  [I in keyof Args]: IsAny<Args[I]> extends true
    ? Args[I]
    : Args[I] extends LooseContext
      ? Ctx
      : Args[I]
}
```
