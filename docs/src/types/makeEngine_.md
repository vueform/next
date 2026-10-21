```ts
/**
 * The headless half of a form: conditions, expressions, validation, payload,
 * and virtual element contexts for the index's unmounted nodes. Mounted
 * elements claim nodes (`node.el$`) and take over; the engine answers for
 * everything else.
 *
 * Must run inside the instance's effect scope so availability computeds and
 * async condition watchers are disposed by `destroy()`.
 */
function makeEngine(options: {
  index: SchemaIndex
  store: ModelStore
  vueform: VueformInstance
  validationSchema?: StandardSchemaV1
  scope: EffectScope
  languages?: LanguagesProp
}): {
  find: (path: string) => StatefulElement | undefined
  virtualForm$: any
  submits: Ref<boolean, boolean>
  validate: () => Promise<boolean>
  invalid: ComputedRef<boolean>
  errors: ComputedRef<string[]>
  issues: ComputedRef<Issue[]>
  payload: ComputedRef<Record<string, any>>
  empty: ComputedRef<boolean>
  rebuild: (diff: SchemaIndexDiff) => void
  validationSchema: StandardSchemaV1<unknown, unknown> | undefined
  validator: Validator
  toStandardSchema: () => StandardSchemaV1
}
```
