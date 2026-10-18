```ts
/**
 * The resolved value union of a `DProp`-typed prop — what the dynamic prop
 * yields once refs/functions are unwrapped. Lets other surfaces (e.g.
 * modifier attribute types) reuse the prop's enum without restating it:
 * `DPropValue<VfButtonProps['severity']>`.
 */
type DPropValue<P> = P extends DProp<infer T, any> ? T : never
```
