```ts
/**
 * Lazy `toRef` proxy over the host's resolved props, passed to class factories
 * as their second argument.
 */
type TemplatePropRefs<T extends ComponentNames> = {
  [K in keyof PropsOf<T>]-?: Ref<PropsOf<T>[K]>
}
```
