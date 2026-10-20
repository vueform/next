```ts
/**
 * The per-part `bindings` aggregate type: for every part key (plus any
 * definition-only key not yet anchored to a part), the key's resolver.
 * Templates always call — `v-bind="bindings.x()"` /
 * `v-bind="bindings.item(…)"` — and slots receive the resolved bag as their
 * `bindings` prop.
 */
type BindingsOf<TParts, TBindings> = {
  [K in keyof TParts | keyof TBindings]: BindingOf<
    AspectOf<TParts, K>,
    AspectOf<TBindings, K>
  >
} & Record<string, any>
```
