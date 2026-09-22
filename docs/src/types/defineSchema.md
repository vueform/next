```ts
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
function defineSchema<
  const S extends (ObjectSchema | ArraySchema) & ExactValidatedSchema<S>,
  Z extends StandardSchemaV1 = StandardSchemaV1,
>(schema: S, validationSchema?: Z & MatchesSchemaModel<S, Z>): S
```
