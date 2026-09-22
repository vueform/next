import {
  type ContextOf,
  type ElementNames,
  type ElementRegistry,
  type GridRegistry,
  type GroupRegistry,
  type ListRegistry,
  type MatrixRegistry,
  type UnknownElement,
  type AlignProp,
  type ValignProp,
  type ElementName,
  type EmitsToProps,
  type FlattenDeep,
  type IsUnion,
  type Join,
  type KebabToPascal,
  type MakeOptional,
  type MakeRequired,
  type Prettify,
  type StandardSchemaV1,
  type UnionToIntersection,
  type ComponentProp,
  type EntryPropOf,
} from '~/types'
import type { Ref } from 'vue'

// ============ TYPE UNIONS =============

/**
 * Union of the `type` prop literals registered in a family registry (derived
 * from each entry's wide props).
 */
type TypesOfRegistry<R> = {
  [K in keyof R]: R[K] extends { props: infer P }
    ? P extends { type?: infer T }
      ? Extract<T, string>
      : never
    : never
}[keyof R]

/**
 * A form schema in array notation with named entries (structural detection
 * helper).
 */
type ArraySchemaType = ReadonlyArray<{ name: ElementName }>

/**
 * Names of registered elements whose props include `as?: 'addon'`.
 */
type AddonableElementNames = {
  [K in ElementNames]: 'as' extends keyof ElementRegistry[K]['props']
    ? K
    : never
}[ElementNames]

/**
 * Grid cell layout properties that can be merged with element schemas or
 * content.
 */
type GridCellLayoutProps = {
  colspan?: number | null
  rowspan?: number | null
  align?: AlignProp | null
  valign?: ValignProp | null
  attrs?: GridCellAttrs
}

/**
 * Readonly-compatible counterpart of `GridSchema` used as the inference
 * constraint in type-level helpers — `defineSchema`'s `const` narrowing turns
 * `grid` into readonly tuples, which never satisfy the mutable `GridSchema`.
 */
type GridSchemaLike = readonly (readonly (GridCellContent | GridCellSchema)[])[]

/**
 * Whether a registered element's wide props include a `modelValue` prop (i.e.
 * the element carries form data).
 */
type HasModelProp<N extends ElementNames> =
  'modelValue' extends keyof ElementRegistry[N]['props'] ? true : false

// ============== SCHEMA ================

/**
 * Widens array model members (at any depth) to also accept their readonly
 * counterparts. `defineSchema`'s `const` type parameter narrows literal arrays
 * (e.g. `default: [1, 2]` or `default: { row: ['a'] }`) to readonly tuples,
 * which are not assignable to the mutable arrays the element models use —
 * without this, a readonly array default fails `ConstrainEntryModel`'s check,
 * inference falls back to the `(ObjectSchema | ArraySchema) & …` constraint,
 * and the `ArraySchema` member leaks Array prototype keys into `Paths` (i.e.
 * `find()` suggestions).
 *
 * Validation-only: never surfaces as a model type, so mapping object members
 * (which structurally widens class instances like `Date`) is safe.
 */
type ModelWithReadonly<M> = M extends readonly (infer E)[]
  ? M | readonly ModelWithReadonly<E>[]
  : M extends (...args: any) => any
    ? M
    : M extends Record<string, any>
      ? { [K in keyof M]: ModelWithReadonly<M[K]> }
      : M

/**
 * Item/group key props re-checked against the entry's `items` / `options`
 * shape. Includes core `item*` / `group*` names and PrimeVue `option*` aliases
 * — names that are absent on a given element's props are skipped.
 */
type ItemKeyPropNames =
  | 'itemValue'
  | 'itemLabel'
  | 'itemDisabled'
  | 'itemConditions'
  | 'groupLabel'
  | 'groupChildren'
  | 'groupConditions'
  | 'optionValue'
  | 'optionLabel'
  | 'optionDisabled'
  | 'optionConditions'
  | 'optionGroupLabel'
  | 'optionGroupChildren'
  | 'optionGroupConditions'

/**
 * Re-narrows item/group key props from the registry props instantiated with the
 * schema entry. Invalid keys (`itemValue: 'idf'` / `optionValue: 'idf'` against
 * `{ id, name }` items) and key props on synthetic shapes (scalar arrays,
 * record maps) fail the same way a wrong `modelValue` does.
 */
type ConstrainEntryItemKeys<El, P> = [
  Extract<keyof P, ItemKeyPropNames>,
] extends [never]
  ? El
  : El extends Pick<P, Extract<keyof El, ItemKeyPropNames> & keyof P>
    ? El
    : Omit<El, ItemKeyPropNames> &
        Pick<P, Extract<keyof El, ItemKeyPropNames> & keyof P>

/**
 * Re-narrows the model-coupled props (`modelValue`, `default`) and item/group
 * key props of a schema entry from its registry entry instantiated with the
 * entry itself — this is where `items` / `itemValue` / `multiple` / `translate`
 * / `languages` (or an adapter's own model-driving props) constrain the
 * accepted model, and where `itemValue` / `itemLabel` / `groupChildren` (and
 * the PrimeVue `option*` aliases) are checked against the `items` / `options`
 * shape.
 */
type ConstrainEntryModel<
  El,
  N extends ElementNames,
> = ElementRegistry<El>[N]['props'] extends infer P
  ? ConstrainEntryItemKeys<
      HasModelProp<N> extends true
        ? P extends { modelValue?: infer Model }
          ? El extends { modelValue?: ModelWithReadonly<Model> } & {
              default?: ModelWithReadonly<Model>
            }
            ? El
            : Omit<El, 'modelValue' | 'default'> & {
                modelValue?: ModelWithReadonly<Model>
                default?: ModelWithReadonly<Model>
              }
          : El
        : El,
      P
    >
  : El

/**
 * Recursively validates nested `schema` objects/arrays on group/list entries.
 * Grid cells are not re-validated (parity with the container's runtime
 * resolution).
 */
type ValidateNestedSchema<El> = El extends { schema: infer S }
  ? Omit<El, 'schema'> & {
      schema: S extends readonly any[] | Record<string, any>
        ? { [K in keyof S]: ValidateSchemaEntry<S[K]> }
        : S
    }
  : El

/**
 * Checks whether an object type has exactly one key.
 */
type IsSingleKey<T> = keyof T & string extends infer K
  ? K extends any
    ? [Exclude<keyof T & string, K>] extends [never]
      ? true
      : false
    : never
  : never

/**
 * Extracts the schema entry of a single-element schema (used for `flat` lists).
 */
type SingleSchemaElement<S> = [S] extends [ArraySchemaType]
  ? S extends readonly [infer E]
    ? E
    : never
  : string extends keyof S
    ? never
    : [IsSingleKey<S>] extends [true]
      ? S[keyof S & string]
      : never

/**
 * The synthetic prototype entry a non-flat list wraps its rows in at runtime
 * (see the list blueprint's `prototype`).
 */
type ListRowEntry<S> = { type: 'group'; nested: true; schema: S }

/**
 * Converts an array schema to its object-keyed equivalent, recursing into
 * group/list children.
 */
type ToObjectSchema<T> = [T] extends [ArraySchemaType]
  ? {
      readonly [
        El in T[number] as El extends { name: infer K extends string }
          ? K
          : never
      ]: El extends {
        type: GroupTypes
        schema: infer S
      }
        ? Omit<El, 'schema'> & { schema: ToObjectSchema<S> }
        : El extends { type: ListTypes }
          ? Omit<El, 'schema'> &
              (El extends { schema: infer S }
                ? { schema: ToObjectSchema<S> }
                : El)
          : El
    }
  : T

/**
 * Resolves the model type of a leaf schema entry from its registry entry
 * instantiated with the entry itself (so `items` / `translate` / etc. narrow
 * it), falling back to `any`.
 */
type ModelOfElement<
  N extends ElementNames,
  El,
> = ElementRegistry<El>[N]['props'] extends { modelValue?: infer M }
  ? Exclude<M, undefined>
  : any

/**
 * Converts an object schema to its complete model type. Non-nested groups and
 * grids merge their children into the parent level.
 */
type ObjectSchemaToModel<T> = Prettify<
  {
    [
      K in keyof T & string as T[K] extends { type: GroupTypes | GridTypes }
        ? T[K] extends { nested: true }
          ? K
          : never
        : K
    ]: ElementToModel<T[K]>
  } & UnionToIntersection<
    | {
        [K in keyof T & string]: T[K] extends {
          type: GroupTypes
          schema: infer S
        }
          ? T[K] extends { nested: true }
            ? {}
            : [FormSchema] extends [S]
              ? {}
              : string extends keyof S
                ? {}
                : ObjectSchemaToModel<ToObjectSchema<S>>
          : T[K] extends {
                type: GridTypes
                grid: infer G extends GridSchemaLike
              }
            ? T[K] extends { nested: true }
              ? {}
              : ObjectSchemaToModel<GridToSchema<G>>
            : {}
      }[keyof T & string]
    | {}
  >
>

// =============== GRID =================

/**
 * Resolves the model type for a single list item element.
 */
type ListItemModel<El> = El extends {
  flat: true
  schema: infer S
}
  ? FlattenedListModel<S>
  : El extends { schema: infer S }
    ? SchemaToModel<S>
    : any

/**
 * Resolves the model type used for path-based value access (containers resolve
 * to their nested model regardless of `nested`, matching runtime `get`).
 */
type ElementModelForPath<El> = El extends {
  type: GroupTypes
  schema: infer S
}
  ? SchemaToModel<S>
  : El extends { type: GridTypes; grid: infer G extends GridSchemaLike }
    ? ObjectSchemaToModel<GridToSchema<G>>
    : ElementToModel<El>

/**
 * Deeply accesses a type by a dot-separated path string, resolving to `any`
 * when the path cannot be followed.
 */
type DeepPropAccess<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? DeepPropAccess<T[K], R>
    : any
  : P extends keyof T
    ? T[P]
    : any

/**
 * Removes `null` and `undefined` deeply from a model type and drops optional
 * modifiers. Validation-only (never surfaces as a model type): the compile-time
 * Standard Schema check compares structural shape only, because required-ness /
 * optionality is the runtime validator's concern and leaf element models are
 * nullable by design (e.g. a text model is `string | number | null`).
 */
type StripNullish<T> = T extends null | undefined
  ? never
  : T extends (...args: any) => any
    ? T
    : T extends readonly (infer E)[]
      ? StripNullish<E>[]
      : T extends Record<string, any>
        ? { [K in keyof T]-?: StripNullish<T[K]> }
        : T

/**
 * Keys of the (null-stripped) Standard Schema input that are missing from, or
 * structurally incompatible with, the (null-stripped) model shape. The input
 * may be narrower than the model (e.g. `z.enum(['a'])` against a `string`
 * model) — the model being narrower is a mismatch.
 */
type MismatchedModelKeys<SM, SI> = {
  [K in keyof SI]-?: K extends keyof SM
    ? [SI[K]] extends [SM[K]]
      ? never
      : K
    : K
}[keyof SI]

/**
 * Union of all registered group element type strings.
 */
export type GroupTypes = TypesOfRegistry<GroupRegistry>

/**
 * Union of all registered list element type strings.
 */
export type ListTypes = TypesOfRegistry<ListRegistry>

// ============ VALIDATION ==============

/**
 * Union of all registered grid element type strings.
 */
export type GridTypes = TypesOfRegistry<GridRegistry>

/**
 * Union of all registered matrix element type strings.
 */
export type MatrixTypes = TypesOfRegistry<MatrixRegistry>

/**
 * Resolves the registered component name for a schema `type` string using the
 * runtime convention `Vf${PascalCase(type)}` (exactly what `useSchema` does),
 * filtered by the registered element names. Unknown type strings resolve to
 * `never`.
 */
export type ElementNameOfType<T extends string> = Extract<
  `Vf${KebabToPascal<T>}`,
  ElementNames
>

/**
 * The schema-entry surface for a registered element: its props (narrowed by
 * `TEntry` when provided) plus `on*` event-handler props derived from its
 * emits.
 */
export type SchemaEntryOf<
  N extends ElementNames,
  TEntry = Record<string, any>,
> = ElementRegistry<TEntry>[N]['props'] &
  EmitsToProps<ElementRegistry<TEntry>[N]['emits']>

/**
 * An element schema definition with a required `type` property. This is the
 * autocomplete surface for schema entries — a union over every registered
 * element, discriminated by the `type` literal.
 */
export type NamedElementSchema = MakeRequired<
  { [K in ElementNames]: SchemaEntryOf<K> }[ElementNames],
  'type'
>

/**
 * An element schema definition where the `name` property is optional (inferred
 * from the object key).
 */
export type ElementSchema = MakeOptional<NamedElementSchema, 'name'>

// =========== LIST HELPERS =============

/**
 * A form schema expressed as a readonly array of named element schemas.
 */
export type ArraySchema = readonly NamedElementSchema[]

/**
 * A form schema expressed as an object mapping field names to element schemas.
 */
export type ObjectSchema = {
  [key: string]: ElementSchema
}

/**
 * The top-level form schema type, accepting either an array or object notation.
 */
export type FormSchema = ArraySchema | ObjectSchema

/**
 * An element schema that can be rendered inside an addon slot. Only element
 * types whose props include `as?: 'addon'` are accepted.
 */
export type AddonSchema = MakeRequired<
  { [K in AddonableElementNames]: SchemaEntryOf<K> }[AddonableElementNames],
  'type'
>

// ============== PATHS =================

/**
 * The content of a single grid cell: an element schema, a string reference, or
 * null for an empty cell.
 */
export type GridCellContent = NamedElementSchema | string | null

/**
 * Arbitrary HTML attributes applied to a grid cell's wrapper element.
 */
export type GridCellAttrs = Record<string, any>

/**
 * A grid cell defined as a flat object merging grid layout properties with
 * either an element schema (has `type`) or text content (has `content`).
 */
export type GridCellSchema = GridCellLayoutProps &
  (NamedElementSchema | { content?: string })

// ============== MODEL =================

/**
 * A two-dimensional grid schema where each row is an array of cell content or
 * cell objects.
 */
export type GridSchema = (GridCellContent | GridCellSchema)[][]

/**
 * Converts a grid cell definition to its object-schema representation (named
 * element cells keyed by their `name`).
 */
export type GridToSchema<T> = {
  [K in Extract<FlattenDeep<T>, { name: ElementName }> as K['name']]: K
}

/**
 * Validates a single schema entry: resolves the registered component from its
 * `type`, re-narrows the model-coupled and item-key props from the registry
 * entry, then recursively validates nested schemas.
 *
 * When `type` is missing or unknown, falls back to `ElementSchema` so object
 * literals still get element prop autocomplete inside `defineSchema`.
 */
export type ValidateSchemaEntry<El> = El extends {
  type: infer TY extends string
}
  ? ElementNameOfType<TY> extends infer N
    ? [N] extends [never]
      ? ElementSchema
      : N extends ElementNames
        ? ValidateNestedSchema<ConstrainEntryModel<El, N>>
        : ElementSchema
    : ElementSchema
  : ElementSchema

/**
 * Maps a schema (object or array) through `ValidateSchemaEntry`, replacing each
 * entry with the expected type when validation fails so TypeScript surfaces
 * property-level errors (e.g. wrong `modelValue` or `itemValue`).
 */
export type ExactValidatedSchema<O> = {
  [K in keyof O]: O[K] extends ValidateSchemaEntry<O[K]>
    ? O[K]
    : ValidateSchemaEntry<O[K]>
}

// ======== STANDARD SCHEMA CHECK =======

/**
 * Flattens a list element's child schema into its model type.
 */
export type FlattenedListModel<S> =
  SingleSchemaElement<ToObjectSchema<S>> extends infer E
    ? [E] extends [never]
      ? any
      : ElementToModel<E>
    : any

/**
 * Computes a union of all valid dot-separated paths within a form schema. Wide
 * / index-signature schemas yield `never` (path suggestions require a concrete
 * schema).
 */
export type Paths<T> = [FormSchema] extends [T]
  ? never
  : [T] extends [ArraySchemaType]
    ? Paths<ToObjectSchema<T>>
    : string extends keyof T
      ? never
      : {
          [K in keyof T & string]: T[K] extends infer El
            ? El extends {
                type: GroupTypes
                schema: infer S
              }
              ? K | Join<K, Paths<S>>
              : El extends {
                    type: ListTypes
                    flat: true
                    schema: infer S
                  }
                ? // List indices use a literal `'0'` (not `${bigint}`) so
                  // suggestions can actually display a concrete path —
                  // template-literal types never appear in IDE completions.
                  // Other indices (`list.3.…`) are still accepted and fully
                  // narrowed: `find` also takes `string & {}` and path
                  // resolution matches any numeric segment.
                  | K
                  | Join<
                      K,
                      Paths<{
                        [I in '0']: SingleSchemaElement<ToObjectSchema<S>>
                      }>
                    >
                : El extends { type: ListTypes; schema: infer S }
                  ? K | Join<K, '0'> | Join<Join<K, '0'>, Paths<S>>
                  : El extends {
                        type: GridTypes
                        grid: infer G extends GridSchemaLike
                      }
                    ? K | Join<K, Paths<GridToSchema<G>>>
                    : // Require `type` so only element entries produce paths —
                      // keys of accidentally wide schema types (e.g. Array
                      // prototype members) must not surface as suggestions.
                      El extends { type: string }
                      ? K
                      : never
            : never
        }[keyof T & string]

/**
 * Validates a Standard Schema's inferred input type against a form schema's
 * model type (`SchemaToModel`). Resolves to `unknown` when compatible — or when
 * the check is vacuous (loose schemas, untyped/union/non-object inputs) — and
 * to a readable diagnostic object otherwise, so intersecting it with the
 * Standard Schema parameter surfaces per-key errors at the call site.
 */
export type MatchesSchemaModel<S, Z extends StandardSchemaV1> =
  StandardSchemaV1.InferInput<Z> extends infer I
    ? [unknown] extends [I]
      ? unknown
      : IsUnion<I> extends true
        ? unknown
        : SchemaToModel<S> extends infer M
          ? string extends keyof M
            ? unknown
            : StripNullish<I> extends infer SI
              ? SI extends Record<string, any>
                ? StripNullish<M> extends infer SM
                  ? [MismatchedModelKeys<SM, SI>] extends [never]
                    ? unknown
                    : {
                        'Validation schema input does not match the schema model — mismatched keys': MismatchedModelKeys<
                          SM,
                          SI
                        >
                      }
                  : never
                : {
                    'Validation schema input must be an object type matching the schema model': I
                  }
              : never
          : never
    : never

// ========== MODEL BY PATH =============

/**
 * Resolves the schema entry object at a dot-separated path (the element
 * config). Non-flat list rows resolve to the synthetic group prototype the list
 * wraps its rows in at runtime. Unresolvable paths yield `never`.
 */
export type GetSchemaEntryByPath<T, P extends string> = [FormSchema] extends [T]
  ? never
  : [T] extends [ArraySchemaType]
    ? GetSchemaEntryByPath<ToObjectSchema<T>, P>
    : P extends `${infer F}.${infer R}`
      ? F extends keyof T
        ? T[F] extends infer El
          ? El extends {
              type: GroupTypes
              schema: infer S
            }
            ? GetSchemaEntryByPath<S, R>
            : El extends {
                  type: GridTypes
                  grid?: infer G extends GridSchemaLike
                }
              ? GetSchemaEntryByPath<GridToSchema<G>, R>
              : El extends {
                    type: ListTypes
                    flat: true
                    schema: infer S
                  }
                ? GetSchemaEntryByPath<
                    {
                      [I in `${bigint}`]: SingleSchemaElement<ToObjectSchema<S>>
                    },
                    R
                  >
                : El extends { type: ListTypes; schema: infer S }
                  ? R extends `${bigint}.${infer SR}`
                    ? GetSchemaEntryByPath<S, SR>
                    : R extends `${bigint}`
                      ? ListRowEntry<S>
                      : never
                  : never
          : never
        : never
      : P extends keyof T
        ? T[P]
        : never

/**
 * Extracts the model type from a full element schema entry, handling container
 * nesting (`group` / `grid` / `list`) before registry-driven leaf resolution.
 */
export type ElementToModel<El> = El extends {
  type: GroupTypes
  nested: true
  schema: infer S
}
  ? SchemaToModel<S>
  : El extends {
        type: GridTypes
        nested: true
        grid: infer G extends GridSchemaLike
      }
    ? ObjectSchemaToModel<GridToSchema<G>>
    : El extends {
          type: ListTypes
          flat: true
          schema: infer S
        }
      ? FlattenedListModel<S>[]
      : El extends { type: ListTypes; schema: infer S }
        ? SchemaToModel<S>[]
        : El extends { type: ListTypes }
          ? any[]
          : El extends { type: infer TY extends string }
            ? ElementNameOfType<TY> extends infer N
              ? [N] extends [never]
                ? any
                : N extends ElementNames
                  ? ModelOfElement<N, El>
                  : any
              : any
            : any

/**
 * Converts a form schema into its corresponding model (data) type, mapping each
 * element to its value type.
 *
 * Accepts both the loose `FormSchema` union and narrow `const` schemas returned
 * by `defineSchema` (which are not always assignable to `FormSchema` due to
 * readonly/`as const` literals).
 */
export type SchemaToModel<T> = [FormSchema] extends [T]
  ? Record<string, any>
  : string extends keyof T
    ? Record<string, any>
    : [T] extends [ArraySchemaType]
      ? ObjectSchemaToModel<ToObjectSchema<T>>
      : ObjectSchemaToModel<T>

// ========= CONTEXT BY PATH ============

/**
 * Resolves the model (value) type for a specific dot-separated path within a
 * form schema.
 */
export type ModelByPath<T, P extends string> = [FormSchema] extends [T]
  ? any
  : [T] extends [ArraySchemaType]
    ? ModelByPath<ToObjectSchema<T>, P>
    : P extends `${infer F}.${infer R}`
      ? F extends keyof T
        ? T[F] extends infer El
          ? El extends {
              type: GroupTypes
              schema: infer S
            }
            ? ModelByPath<S, R>
            : El extends {
                  type: GridTypes
                  grid: infer G extends GridSchemaLike
                }
              ? ModelByPath<GridToSchema<G>, R>
              : El extends {
                    type: ListTypes
                    flat: true
                    schema: infer S
                  }
                ? ModelByPath<
                    {
                      [I in `${bigint}`]: SingleSchemaElement<ToObjectSchema<S>>
                    },
                    R
                  >
                : El extends { type: ListTypes }
                  ? R extends `${bigint}`
                    ? ListItemModel<El>
                    : R extends `${bigint}.${infer SR}`
                      ? El extends { schema: infer S }
                        ? ModelByPath<S, SR>
                        : any
                      : any
                  : any
          : any
        : any
      : P extends keyof T
        ? ElementModelForPath<T[P]>
        : any

/**
 * Resolves the element context for a schema path via the registries: the entry
 * at the path is fed back as the registry `TEntry`, so the returned context is
 * fully narrowed by the entry's props (items, translate, …).
 *
 * Unknown paths, unknown types, and union-typed paths fall back to
 * `UnknownElement` (kept cheap — no all-elements context union).
 */
export type ElementByPath<T, P extends string> = [FormSchema] extends [T]
  ? UnknownElement
  : GetSchemaEntryByPath<T, P> extends infer El
    ? [El] extends [never]
      ? UnknownElement
      : El extends { type: infer TY extends string }
        ? ElementNameOfType<TY> extends infer N extends ElementNames
          ? [N] extends [never]
            ? UnknownElement
            : IsUnion<N> extends true
              ? UnknownElement
              : ContextOf<N, El>
          : UnknownElement
        : UnknownElement
    : UnknownElement

/**
 * Resolves the return type for `get()`. When the path contains a `@` separator
 * the portion before it identifies the element and the portion after it is
 * resolved as a (possibly nested) property on the element context. Without `@`
 * the element's model value type is returned.
 */
export type GetResult<
  T,
  P extends string,
> = P extends `${infer ElPath}@${infer PropPath}`
  ? DeepPropAccess<ElementByPath<T, ElPath>, PropPath>
  : ModelByPath<T, P>

/**
 * Resolved array of component and named element prop pairs.
 */
export type ResolvedSchema = {
  component: ComponentProp
  props: NamedElementSchema
}[]

/**
 * Resolves the child `schema` from a registry `TEntry` payload (unwrapping a
 * possible `Ref`), falling back to the wide `FormSchema` when absent.
 */
export type EntrySchemaOf<TEntry> =
  EntryPropOf<TEntry, 'schema'> extends infer S
    ? [S] extends [undefined]
      ? FormSchema
      : S extends Ref<infer V>
        ? V
        : S
    : FormSchema
