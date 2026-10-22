```ts
/**
 * The context expression functions read from: the owning Vueform instance (set
 * once by the adapter, used to resolve module doorways like date and locale
 * against the right Vueform instance) plus per-evaluation state bound before
 * each `evaluate()` call.
 */
type ExpressionFunctionContext = {
  vueform?: VueformInstance
  form$?: FormContext
  el$?: any
}
```
