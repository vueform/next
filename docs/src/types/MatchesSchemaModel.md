```ts
/**
 * Validates a Standard Schema's inferred input type against a form schema's
 * model type (`SchemaToModel`). Resolves to `unknown` when compatible — or when
 * the check is vacuous (loose schemas, untyped/union/non-object inputs) — and
 * to a readable diagnostic object otherwise, so intersecting it with the
 * Standard Schema parameter surfaces per-key errors at the call site.
 */
type MatchesSchemaModel<S, Z extends StandardSchemaV1> =
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
```
