```ts
/**
 * A factory that produces the low-level `ExpressionEngine` from the module
 * options and the owning Vueform instance (adapter functions resolve module
 * doorways like date and locale against it). `createExpression` wraps the
 * engine with everything engine-independent: the `{…}` chain format, escapes,
 * result normalization, the transient-warning queue, `installed`, and `warn`.
 */
type ExpressionAdapter = (
  options: ExpressionModuleOptions,
  vueform: VueformInstance
) => ExpressionEngine
```
