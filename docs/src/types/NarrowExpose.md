````ts
/**
 * Replaces the wide (constraint-instantiated) members of an Expose surface with
 * their narrow, prop-instantiated counterparts, for a component's `*Context`
 * interface:
 *
 * ```ts
 * NarrowExpose<VfSelectExpose, SelectApi<TProps>>
 * ```
 *
 * `TNarrow` is the prop-instantiated API slice (intersect multiple slices when
 * a component extension adds members). Its keys match the wide instantiation
 * carried by the Expose, so they double as the strip list. Stripping before
 * intersecting is required — otherwise wide and narrow members merge and e.g.
 * `Ref<any> & Ref<narrow>` collapses to `any`.
 */
type NarrowExpose<TExpose, TNarrow extends Record<string, any>> = Omit<
  TExpose,
  keyof TNarrow
> &
  TNarrow
````
