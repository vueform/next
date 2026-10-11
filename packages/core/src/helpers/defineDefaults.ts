/**
 * Primitives and callables that may appear as literal prop defaults without a
 * factory wrapper.
 */
type NativeType =
  | null
  | undefined
  | number
  | string
  | boolean
  | symbol
  | Function

/**
 * Either a factory that receives props and returns the default, or a literal
 * value when it is a native type.
 */
type InferDefault<P, T> =
  | ((props: P) => T & {})
  | (T extends NativeType ? T : never)

/**
 * Maps each prop to an optional default expressed as a factory or a matching
 * native literal.
 */
export type InferDefaults<T> = {
  [K in keyof T]?: InferDefault<T, T[K]>
}

/**
 * Returns a typed helper function for declaring component prop defaults
 * inferred from the given props type.
 *
 * Curried on purpose: TypeScript cannot partially infer remaining type
 * parameters, so `TProps` must be fixed in a first call while the defaults
 * object (and its precise `const` shape) is inferred in a second. A single
 * `defineDefaults<TProps>(…)` call would widen the return to
 * `InferDefaults<TProps>`, which breaks Vue `withDefaults` on generic SFCs.
 *
 * @private
 */
export function defineDefaults<TProps>() {
  return <const TDefaults extends InferDefaults<TProps>>(
    defaults: TDefaults
  ): TDefaults => defaults
}

/**
 * Returns blueprint defaults with the element `type` replaced by the
 * component's own element name (e.g. `'dropdown'`).
 *
 * Blueprint `defaults` bake in the blueprint's canonical type literal (e.g.
 * `'select'`), which a blueprint-reusing component cannot pass to
 * `withDefaults` — its `type` prop expects the component's own literal, at both
 * type level and runtime. The generic parameter keeps the literal inferred, so
 * no `as const` is needed at the call site.
 *
 * @private
 * @param defaults The blueprint defaults whose `type` to replace.
 * @param type The component's own element type literal.
 */
export function withType<TDefaults extends { type: string }, T extends string>(
  defaults: TDefaults,
  type: T
): Omit<TDefaults, 'type'> & { type: T } {
  return { ...defaults, type }
}
