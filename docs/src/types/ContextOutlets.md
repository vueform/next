```ts
/**
 * The `outlets` shape of a public context: every declared slot name, optional
 * (an outlet only exists when an inline slot or `slots`-prop entry fills it),
 * with its payload types kept but made bivariant (see `BivariantSlot`).
 */
type ContextOutlets<TSlots> = {
  // Context-carrying slots (`template`, form `content`, field `default`, …)
  // keep their signature but with the `context` payload member widened to
  // `unknown`: it embeds the host context itself, which the SFC instantiates
  // with its own generic props — incompatible with the canonical
  // instantiation in both directions, so bivariance can't bridge that one
  // member. `unknown` accepts any concrete context in the covariant
  // direction (which is all bivariance needs) without leaking `any` to
  // consumers; the consumer already holds a typed `context` anyway.
  //
  // Detected by a `context` key on the inferred payload — not by
  // assignability to `(props: { context: any }) => …`, which zero-arg slots
  // (`() => VNode[]`) and empty-payload slots (`(props: {}) => VNode[]`)
  // would also match (fewer/looser params accept more). For a zero-arg slot
  // the payload infers as `unknown`, whose `keyof` is `never`, so it stays
  // fully typed.
  [K in keyof TSlots]?: TSlots[K] extends (props: infer P) => infer R
    ? 'context' extends keyof P
      ? BivariantSlot<
          (props: {
            [K2 in keyof P]: K2 extends 'context' ? unknown : P[K2]
          }) => R
        >
      : BivariantSlot<TSlots[K]>
    : BivariantSlot<TSlots[K]>
}
```
