```ts
/**
 * The public `props` shape on the context: resolved props minus type-only brand
 * keys (symbol keys such as the items generics brand). The brand varies with
 * each component instance's inferred type parameters, so keeping it would make
 * generic instances unassignable to a component's canonical context (e.g.
 * `VfSelectContext` built from bare `VfSelectProps`). The brand is type-only
 * (never set at runtime) and its consumers (`ItemsGenericsOf`) read blueprint
 * setup props, not context props.
 */
type ContextProps<TProps> = {
  [K in keyof TProps as K extends symbol ? never : K]: TProps[K]
}
```
