```ts
/**
 * One part's aggregate binding member: the key's resolver — always present,
 * never optional — called with the part's arguments or none:
 * `v-bind="bindings.input()"`, `v-bind="bindings.item(item)"`.
 */
type BindingOf<P, B> = (
  ...args: BindingArgsOf<P, B>
) => BindingBagOf<P, B> | undefined
```
