```ts
/**
 * Functional-signature symmetry check between an aspect surface and the parts
 * spine — see `AsymmetricKeys`.
 */
type PartSymmetric<T, TParts> = string extends keyof T
  ? unknown
  : [AsymmetricKeys<T, TParts>] extends [never]
    ? unknown
    : { __membersNotMatchingPartSignature: AsymmetricKeys<T, TParts> }
```
