```ts
/**
 * Represents a tracked form instance in the devtools registry.
 */
interface TrackedForm {
  uid: string
  name: string | undefined
  elements$: ShallowReactive<Map<string, any>>
  invalid: boolean
  errors: Record<string, string[]>
}
```
