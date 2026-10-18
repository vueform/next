```ts
/**
 * The merged surface `useBlueprint` returns for one binding system
 * (`a11yBindings` / `modifiers`): the component context's Expose-declared type
 * when the slots carry one (precise per component), otherwise the
 * blueprint-provided base type (when the api carries one) intersected with
 * the loose part-keyed shape so component-registered bags stay readable.
 */
type MergedBindings<TApi, TSlots, K extends string, TLoose> = ComputedRef<
  [SlotContextOf<TSlots>] extends [Record<K, infer M>]
    ? M
    : K extends keyof TApi
      ? UnwrapTopLevelRef<TApi[K]> & TLoose
      : TLoose
>
```
