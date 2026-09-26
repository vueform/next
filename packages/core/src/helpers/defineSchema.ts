import { isRef, toRaw } from 'vue'
import type {
  ArraySchema,
  ExactValidatedSchema,
  FormSchema,
  MatchesSchemaModel,
  ObjectSchema,
  StandardSchemaV1,
} from '#core/types'

// Side-table: never mutates the user's schema, GC'd with it. Reactive schemas
// key by the computed ref (its getter returns a fresh object each time).
const validationSchemas = new WeakMap<object, StandardSchemaV1>()

/**
 * Keys a Standard Schema to a schema object or ref in the shared side-table,
 * for `getAttachedValidationSchema` to find. Internal plumbing shared with
 * `defineComputedSchema`.
 *
 * @private
 */
export function attachValidationSchema(
  schema: object,
  validationSchema: StandardSchemaV1
) {
  validationSchemas.set(schema, validationSchema)
}

/**
 * Returns the Standard Schema attached to a schema (or schema ref) via
 * `defineSchema` / `defineComputedSchema`'s second argument, if any. For refs
 * the ref itself is tried first, then the unwrapped schema object. Lookups go
 * through `toRaw` since schemas passed as props arrive as reactive proxies
 * while the WeakMap is keyed by the original object.
 *
 * @private
 * @param schema The schema object or ref to look up.
 */
export function getAttachedValidationSchema(
  schema: unknown
): StandardSchemaV1 | undefined {
  if (typeof schema !== 'object' || schema === null) return undefined

  const direct = validationSchemas.get(toRaw(schema))
  if (direct || !isRef(schema)) return direct

  const unwrapped = schema.value
  return typeof unwrapped === 'object' && unwrapped !== null
    ? validationSchemas.get(toRaw(unwrapped))
    : undefined
}

/**
 * Identity helper that validates and `const`-narrows a form schema so it can
 * drive type-level features (`SchemaToModel`, typed `find()` paths, …).
 *
 * Each entry is validated against its registered element's props — including
 * prop-driven model narrowing, so e.g. `items` / `itemValue` constrain
 * `modelValue` / `default`, `itemValue` / `itemLabel` / `groupChildren` (and
 * PrimeVue `optionValue` / `optionLabel` / `optionGroupChildren`, …) are
 * checked against the `items` / `options` shape, and `translate: true` requires
 * a locale-keyed `modelValue`. Nested `schema` objects/arrays are validated
 * recursively.
 *
 * An optional Standard Schema (Zod, Valibot, ArkType, …) can be passed as the
 * second argument for form-level (cross-field) validation. Its inferred input
 * type is checked against the schema's model type at compile time, and it is
 * attached to the schema object so forms and models using this schema pick it
 * up automatically — no need to pass it again.
 *
 * @param schema The form schema in object or array notation.
 * @param validationSchema Optional Standard Schema validated against the whole
 *   form model, attached to the schema for automatic pickup.
 */
export function defineSchema<
  const S extends (ObjectSchema | ArraySchema) & ExactValidatedSchema<S>,
  Z extends StandardSchemaV1 = StandardSchemaV1,
>(schema: S, validationSchema?: Z & MatchesSchemaModel<S, Z>): S
export function defineSchema(
  schema: FormSchema,
  validationSchema?: StandardSchemaV1
) {
  if (validationSchema) {
    attachValidationSchema(schema, validationSchema)
  }

  return schema
}
