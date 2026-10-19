```ts
/**
 * Part-key subset check: every key of an aspect surface (classes, modifiers,
 * a11y) must be backed by a part — a key of `TParts` or a layout part core
 * renders. Violations surface as an impossible constraint carrying the
 * offending keys in `__keysWithoutPart`. Loose surfaces (string index
 * signatures) are exempt.
 */
type PartKeyed<T, TParts> = string extends keyof T
  ? unknown
  : [Exclude<keyof T, keyof TParts | LayoutPartKeys>] extends [never]
    ? unknown
    : { __keysWithoutPart: Exclude<keyof T, keyof TParts | LayoutPartKeys> }
```
