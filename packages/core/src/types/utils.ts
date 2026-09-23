import type { LooseContext } from './shared'
import type { Ref } from 'vue'

/**
 * Unwraps the inner composable from a `defineFeature` curried signature.
 */
type UnwrapFeature<F> = F extends (config?: any) => infer Next ? Next : F

/**
 * Resolves the return type of a factory, including those created with
 * `defineFeature` which use a curried `(config?) => (options) => result`
 * signature.
 */
type FeatureReturn<F> =
  UnwrapFeature<F> extends (options: any) => infer R
    ? R
    : UnwrapFeature<F> extends (...args: any[]) => infer R
      ? R
      : never

/**
 * Pairs a factory with keys to pick from its return type for `ReturnsOf`
 * aggregation.
 */
type Pair<Fn extends (...args: any) => any, Keys extends PropertyKey[]> = [
  Fn,
  Keys,
]

/**
 * Extracts keys that are optional in the given type.
 */
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

/**
 * Makes all keys required while preserving undefined in value unions.
 */
type RequirePropsButKeepUndefined<T> = Omit<Required<T>, OptionalKeys<T>> & {
  [K in OptionalKeys<T>]-?: Exclude<T[K], undefined> | undefined
}

type CamelCaseJoin<S extends string> = S extends `${infer A}-${infer B}`
  ? CamelCaseJoin<`${A}${Capitalize<B>}`>
  : S extends `${infer A}_${infer B}`
    ? CamelCaseJoin<`${A}${Capitalize<B>}`>
    : S

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
export type NarrowExpose<TExpose, TNarrow extends Record<string, any>> = Omit<
  TExpose,
  keyof TNarrow
> &
  TNarrow

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
 * _names_ of `TProps` plus the types of the added keys. Caveat: an added prop
 * typed with `*Context` / `*Slots` would reintroduce the cycle — keep own props
 * self-contained.
 */
export type WidenProps<TProps, TLoose> = TLoose & Omit<TProps, keyof TLoose>

/**
 * `true` if `T` is `any`, otherwise `false`.
 */
export type IsAny<T> = 0 extends 1 & T ? true : false

/**
 * Unwraps a single top-level `Ref` without distributing over unions.
 *
 * Vue's `ShallowUnwrapRef` uses a distributive `T extends Ref ? …` check, which
 * also peels `Ref` out of prop unions that list it as a member (e.g.
 * `PageProp`, `DProp`). Generic SFCs already expose some bindings unwrapped, so
 * applying distributive unwrap again would corrupt those unions. Wrapping the
 * check in a tuple keeps the condition non-distributive.
 */
export type UnwrapTopLevelRef<T> = [T] extends [Ref<infer V>] ? V : T

/**
 * Unwraps a single top-level `Ref` per key without distributing over unions —
 * mirrors what `slotContext` / `ContextOf` produce for the component context.
 */
export type UnwrapApiRefs<T> = {
  [K in keyof T]: UnwrapTopLevelRef<T[K]>
}

/**
 * Builds an event `context$` type from a blueprint factory: the factory's
 * return type (refs unwrapped) with the keys of `TGenerics` (model / items
 * fields) replaced by the component's generic-aware versions.
 *
 * Per-blueprint contexts must wrap this in an `interface` (e.g. `SelectContext
 * extends Context<typeof useBlueprint, …>`) so the blueprint type is resolved
 * lazily and does not cycle through the component registry.
 */
export type Context<
  TBlueprint extends (...args: any[]) => any,
  TGenerics,
> = Omit<UnwrapApiRefs<ReturnType<TBlueprint>>, keyof TGenerics> & TGenerics

/**
 * Overlays generic API and props fields onto a component context for
 * `#template` slot typing.
 *
 * Widens `outlets` so the blueprint context (which carries the generic slot
 * map) stays assignable to the slot context type.
 *
 * Wrap the result in an `interface` at the component boundary so registry
 * cycles stay lazy.
 */
export type GenericContext<
  TContext extends { props: Record<string, any> },
  TApi extends Record<string, any>,
  TProps extends Record<string, any>,
> = Omit<TContext, keyof TApi | 'props' | 'outlets'> &
  TApi & {
    outlets: Record<string, any>
    props: Omit<TContext['props'], keyof TProps> & TProps
  }

/**
 * Remaps one event-tuple's args, replacing every `LooseContext` placeholder
 * with `Ctx`.
 */
export type RemapContextArgs<Args, Ctx> = {
  [I in keyof Args]: IsAny<Args[I]> extends true
    ? Args[I]
    : Args[I] extends LooseContext
      ? Ctx
      : Args[I]
}

/**
 * Reads an optional prop from a registry `TEntry` payload (schema entry / props
 * object), falling back to `undefined` when the key is absent.
 *
 * Using `prop?: infer V` on a type that lacks the prop yields `unknown`, which
 * poisons generic extraction (e.g. `groupChildren: unknown`). Keyof-gating
 * keeps missing props as `undefined`, matching SFC generic defaults.
 */
export type EntryPropOf<TEntry, K extends PropertyKey> = K extends keyof TEntry
  ? TEntry[K]
  : undefined

/**
 * Reads an optional prop from a registry `TEntry` payload with a fallback
 * default applied when the key is absent or `undefined`.
 *
 * `any` passes through unchanged (instead of collapsing to the default via
 * `[any] extends [undefined]`) so wide registry instantiations stay maximally
 * permissive.
 */
export type EntryPropOr<TEntry, K extends PropertyKey, TDefault> =
  EntryPropOf<TEntry, K> extends infer V
    ? IsAny<V> extends true
      ? V
      : [V] extends [undefined]
        ? TDefault
        : V
    : TDefault

/**
 * Unwraps a `Ref` wrapper that may appear on a registry entry's prop.
 */
export type UnwrapEntryRef<T> = T extends Ref<infer V> ? V : T

/**
 * Widens a literal scalar to its primitive. Selection values follow the `items`
 * convention: const-narrowed schema literals must not lock the model.
 */
export type WidenScalar<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T

/**
 * Simplifies a mapped or intersected type into a flat object type for better
 * IDE display.
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {}

/**
 * Identity mapped type for generic function parameters (no `& {}`, unlike
 * `Prettify` — safe for large generic contexts).
 *
 * Property access on a value typed as a bare type parameter widens to the
 * constraint's apparent type (`api.items` on `TApi extends DropdownApi` yields
 * `DropdownApi['items']`). Access on a mapped type over the parameter resolves
 * to the indexed access instead (`TApi['items']`), so blueprint extensions can
 * return prop-narrowed API fields without return annotations or casts.
 */
export type Identity<T> = { [K in keyof T]: T[K] }

/**
 * Converts a union type into an intersection by distributing over function
 * parameter positions.
 */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

/**
 * Joins two path segments with a dot separator, producing a template literal
 * type.
 */
export type Join<K, P> = K extends string | number | bigint
  ? P extends string | number | bigint
    ? `${K}.${P}`
    : never
  : never

/**
 * Converts a kebab-case string to PascalCase at the type level.
 */
export type KebabToPascal<S extends string> =
  S extends `${infer Head}-${infer Tail}`
    ? `${Capitalize<Head>}${KebabToPascal<Tail>}`
    : Capitalize<S>

/**
 * Recursively flattens nested arrays into their element type.
 */
export type FlattenDeep<T> = T extends readonly (infer U)[] ? FlattenDeep<U> : T

/**
 * Picks and merges selected return-type keys from an array of `[function,
 * keys[]]` pairs into a single flat object. Keys selected via the second
 * argument `O` are merged as partial (optional) properties.
 */
export type ReturnsOf<
  P extends Pair<any, PropertyKey[]>[],
  O extends Pair<any, PropertyKey[]>[] = [],
> = Prettify<
  UnionToIntersection<
    | {
        [I in keyof P]: P[I] extends Pair<infer F, infer K>
          ? PropertyKey extends keyof FeatureReturn<F>
            ? never
            : Pick<FeatureReturn<F>, Extract<K[number], keyof FeatureReturn<F>>>
          : never
      }[number]
    | {
        [I in keyof O]: O[I] extends Pair<infer F, infer K>
          ? PropertyKey extends keyof FeatureReturn<F>
            ? never
            : Partial<
                Pick<
                  FeatureReturn<F>,
                  Extract<K[number], keyof FeatureReturn<F>>
                >
              >
          : never
      }[number]
  >
>

/**
 * Makes all properties required while preserving `undefined` in the type of
 * originally optional properties.
 */
export type RequiredOrUndefined<T> = T extends object
  ? Prettify<RequirePropsButKeepUndefined<T>>
  : T

/**
 * Makes the specified keys optional in a type while keeping the rest unchanged.
 */
export type MakeOptional<T, K extends PropertyKey> = T extends any
  ? K extends keyof T
    ? Omit<T, K> & Partial<Pick<T, K>>
    : T
  : never

/**
 * Makes the specified keys required in a type while keeping the rest unchanged.
 */
export type MakeRequired<T, K extends PropertyKey> = T extends any
  ? K extends keyof T
    ? Omit<T, K> & Required<Pick<T, K>>
    : T
  : never

/**
 * Camel-cases an identifier: lowers the first character and collapses `-` / `_`
 * separators (`update-model-value` → `updateModelValue`).
 */
export type CamelCase<S extends string> = CamelCaseJoin<Uncapitalize<S>>

/**
 * Kebab-cases an identifier: a `-` is inserted before every uppercase
 * character, which is then lowered (`updateModelValue` →
 * `update-model-value`).
 */
export type KebabCase<S extends string> = S extends `${infer H}${infer T}`
  ? T extends Uncapitalize<T>
    ? `${Uncapitalize<H>}${KebabCase<T>}`
    : `${Uncapitalize<H>}-${KebabCase<T>}`
  : S

/**
 * Extracts event names from a props type by finding `on`-prefixed keys and
 * converting them to camelCase and kebab-case.
 */
export type EventKeysFromProps<T> = keyof {
  [
    K in keyof T as K extends `on${infer E extends Capitalize<string>}`
      ? CamelCase<E> | KebabCase<E>
      : never
  ]: any
}

/**
 * Evaluates to `true` if the type `T` is a union, `false` if it is a single
 * type.
 */
export type IsUnion<T, U = T> = T extends any
  ? [U] extends [T]
    ? false
    : true
  : never

/**
 * Like `Required<T>` but preserves the original property types without removing
 * `undefined`.
 */
export type LooseRequired<T> = {
  [P in keyof (T & Required<T>)]: T[P]
}

/**
 * Extracts keys from `T` whose value type is `boolean`.
 */
export type BooleanKey<T, K extends keyof T = keyof T> = K extends any
  ? T[K] extends boolean
    ? K
    : never
  : never

/**
 * Merges two object types where keys from `E` override matching keys in `T`.
 */
export type SpreadMerge<T, E> = Omit<T, keyof E> & E

/**
 * Wraps a type to allow either a single value or an array of that type.
 */
export type MaybeArray<T> = T | T[]

/**
 * Converts an emits interface into Vue-style `onEventName` prop functions.
 */
export type EmitsToProps<T> = {
  [K in string & keyof T as `on${Capitalize<K>}`]?: (
    ...args: T[K] extends any[] ? T[K] : any[]
  ) => any
}

/**
 * Wraps a type to also accept a contextual function that receives the component
 * context and returns the value.
 *
 * @param context$ The component context passed when used as a function.
 */
export type MaybeContextual<T, TContext = any> =
  T | ((context$: TContext) => T | void)

/**
 * Replaces the `type` property of `T` with `any`, allowing any element type
 * string.
 */
export type WithAnyType<T> = Omit<T, 'type'> & { type?: any }

/**
 * Recursively makes all properties of an object type optional, while preserving
 * arrays as-is.
 */
export type DeepPartial<T> = T extends any[]
  ? T
  : T extends Record<string, any>
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T

/**
 * Makes all keys of `T` optional, while also making the members of keys in `K`
 * individually optional (one-level deep partial).
 */
export type PartialDeepKeys<T, K extends keyof T> = Partial<Omit<T, K>> & {
  [P in K]?: Partial<T[P]>
}

/**
 * Makes specific keys `K` of `T` required while leaving the rest unchanged.
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Makes an object type accept arbitrary extra string keys.
 */
export type OpenObject<T> =
  T extends Record<string, any> ? T & Record<string & {}, any> : T

/**
 * Recursively makes all properties of an object type readonly, including nested
 * objects and arrays.
 */
export type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends any[]
    ? ReadonlyArray<DeepReadonly<T[number]>>
    : T extends Record<string, any>
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T
