```ts
/**
 * Events that trigger validation at the form level, including step and submit
 * events.
 */
type ValidateOnProp = (
  'change' | 'blur' | 'next' | 'back' | 'submit' | (string & {})
)[]
```
