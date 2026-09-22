````ts
/**
 * Builds a component's plain (widest) props type from its generic props
 * interface and the blueprint's plain props:
 *
 * ```ts
 * type VfSelectProps = WidenProps<VfSelectProps, SelectProps>
 * ```
 *
 * Equals `TLoose & Omit<TProps, keyof TLoose>` — the blueprint's plain props
 * plus everything the component adds on top. Component-own props (e.g. `foo`)
 * stay visible to constraints / extensions without a separate `*OwnProps`
 * interface.
 *
 * Prefer this over a wide `TProps` instantiation as the constraint: component
 * props pin `*Context` via slots/context arguments, so constraining on them
 * makes `*Context`'s own type parameter resolve through the interface being
 * defined (order-dependent base-type cycle). The `Omit` only resolves member
 * names_ of `TProps` plus the types of the added keys. Caveat: an added prop
 * typed with `*Context` / `*Slots` would reintroduce the cycle — keep own props
 * self-contained.
 */
type WidenProps<TProps, TLoose> = TLoose & Omit<TProps, keyof TLoose>
````
