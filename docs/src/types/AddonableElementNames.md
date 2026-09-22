```ts
/**
 * Names of registered elements whose props include `as?: 'addon'`.
 */
type AddonableElementNames = {
  [K in ElementNames]: 'as' extends keyof ElementRegistry[K]['props']
    ? K
    : never
}[ElementNames]
```
