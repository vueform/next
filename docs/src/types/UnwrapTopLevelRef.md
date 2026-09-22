```ts
/**
 * Unwraps a single top-level `Ref` without distributing over unions.
 *
 * Vue's `ShallowUnwrapRef` uses a distributive `T extends Ref ? …` check, which
 * also peels `Ref` out of prop unions that list it as a member (e.g.
 * `PageProp`, `DProp`). Generic SFCs already expose some bindings unwrapped, so
 * applying distributive unwrap again would corrupt those unions. Wrapping the
 * check in a tuple keeps the condition non-distributive.
 */
type UnwrapTopLevelRef<T> = [T] extends [Ref<infer V>] ? V : T
```
