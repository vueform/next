```ts
/**
 * Vendored Standard Schema V1 interface (https://standardschema.dev). The spec
 * is a types-only contract implemented by Zod (3.24+), Valibot, ArkType, and
 * others — vendoring it keeps core dependency-free while accepting any
 * spec-compliant schema in `rules` / `validationSchema`.
 */
interface StandardSchemaV1<Input = unknown, Output = Input> {
  /**
   * The Standard Schema properties.
   */
  readonly '~standard': StandardSchemaV1.Props<Input, Output>
}
```
