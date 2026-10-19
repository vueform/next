```ts
/**
 * A11y bag vocabulary check: every attribute of every bag must be `aria-*`,
 * `role`, `id`, `lang`, `tabindex`, or native `disabled`. Encodes the
 * aspect-split doctrine at the type level.
 */
type A11yShaped<T> = string extends keyof T
  ? unknown
  : [InvalidBagKeys<T, A11yAttrKeys>] extends [never]
    ? unknown
    : { __a11yAttrsOutsideAriaVocabulary: InvalidBagKeys<T, A11yAttrKeys> }
```
