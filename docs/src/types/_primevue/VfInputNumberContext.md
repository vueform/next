```ts
/**
 * Public context for VfInputNumber.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
interface VfInputNumberContext extends DefineElementContext<
  VfInputNumberProps,
  VfInputNumberEmits,
  VfInputNumberSlots,
  VfInputNumberParts,
  VfInputNumberClasses,
  VfInputNumberBindings,
  VfInputNumberExpose,
  InputNumberApi
> {}
```
