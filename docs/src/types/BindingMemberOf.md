```ts
/**
 * Default context member type for a binding surface (`a11yBindings` /
 * `modifiers`) when the context is not instantiated with an explicit
 * component-level type: the component context's type when the slots carry
 * one (the SFC side, where `TSlots` is the raw slots interface and the
 * template scope's `context` is the canonical `VfXContext`), otherwise the
 * api-provided member when the blueprint carries one, the loose part-keyed
 * shape as the last resort. Canonical component contexts never resolve
 * through this: they pass `VfXA11y` / `VfXModifiers` explicitly (and their
 * `ContextOutlets<TSlots>` blanks the template scope's `context` to
 * `unknown`, so no self-recursion is possible).
 */
type BindingMemberOf<TSlots, TApi, K extends string, TLoose> = [
  SlotContextOf<TSlots>,
] extends [Record<K, infer M>]
  ? M
  : K extends keyof TApi
    ? UnwrapTopLevelRef<TApi[K]>
    : TLoose
```
