```ts
/**
 * The per-part `bindings` aggregate type: for every part key (plus any
 * aspect-only key not yet anchored to a part), the merged bag (static keys)
 * or its resolver function (functional keys). Templates bind
 * `v-bind="bindings.x"` / `v-bind="bindings.item(…)"` and slots receive the
 * resolved bag as their `bindings` prop.
 */
type BindingsOf<TParts, TClasses, TModifiers, TA11y> = {
  [
    K in keyof TParts | keyof TClasses | keyof TModifiers | keyof TA11y
  ]: BindingOf<
    AspectOf<TParts, K>,
    AspectOf<TClasses, K>,
    AspectOf<TModifiers, K>,
    AspectOf<TA11y, K>
  >
} & Record<string, any>
```
