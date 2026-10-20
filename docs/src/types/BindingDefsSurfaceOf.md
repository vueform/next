```ts
/**
 * The component's bindings definition surface (`VfXBindings`), recovered from
 * the slots' template context via the context's type-only `__bindingDefs`
 * channel; the loose part-keyed shape when the slots carry no typed context.
 */
type BindingDefsSurfaceOf<TSlots> = [SlotContextOf<TSlots>] extends [
  { __bindingDefs?: (defs: infer B) => void },
]
  ? [B] extends [never]
    ? Record<string, any>
    : B
  : Record<string, any>
```
