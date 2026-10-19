```ts
/**
 * One part's aggregate binding member: the merged bag itself (possibly
 * `undefined`) for static keys, bound bare with `v-bind="bindings.x"`; or the
 * key's resolver — always present, never optional — for functional keys,
 * called as `v-bind="bindings.item(…)"`.
 */
type BindingOf<P, C, M, A> = [BindingArgsOf<P, C, M, A>] extends [never]
  ? BindingBagOf<P, M, A> | undefined
  : (...args: BindingArgsOf<P, C, M, A>) => BindingBagOf<P, M, A> | undefined
```
