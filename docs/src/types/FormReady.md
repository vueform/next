```ts
/**
 * Registers a callback fired with the form context once the form is mounted
 * (immediately when it already is). With no argument returns a Promise
 * resolving to the form context.
 */
type FormReady<C> = {
  (cb: (form$: C) => void): void
  (): Promise<C>
}
```
