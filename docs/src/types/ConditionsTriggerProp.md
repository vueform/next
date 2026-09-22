```ts
/**
 * The accepted forms of the `conditions-trigger` prop, used as the single watch
 * source that drives re-evaluation of a component's async conditional props. An
 * array of element paths watches those elements' values, a `Ref` watches the
 * ref, and a function is used as a Vue watch getter. When omitted, the trigger
 * defaults to any change in the model.
 */
type ConditionsTriggerProp<TContext = any> =
  string[] | Ref<any> | ((context$: TContext) => any)
```
